import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Not, Repository } from 'typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import { Survey2 } from './entities/survey2.entity'
import { Survey2Part } from './entities/survey2-part.entity'
import {
  Survey2Question,
  Survey2QuestionAnswerType,
  Survey2QuestionCondition,
  Survey2QuestionType,
} from './entities/survey2-question.entity'
import { Survey2QuestionAnswer } from './entities/survey2-question-answer.entity'
import { Survey2User } from './entities/survey2-user.entity'
import { Survey2UserAnswer } from './entities/survey2-user-answer.entity'
import { Survey2UserAnswerText } from './entities/survey2-user-answer-text.entity'
import {
  Survey2CreateDto,
  Survey2PartCreateDto,
  Survey2QuestionCreateDto,
  Survey2SubmitDto,
  Survey2UpdateDto,
} from './dto/survey2.dto'

interface SubmitValidation {
  activeQuestions: Map<string, Survey2Question>
  answerToQuestion: Map<string, { answer: Survey2QuestionAnswer; question: Survey2Question }>
}

@Injectable()
export class Survey2Service {
  private readonly logger = new Logger(Survey2Service.name)

  constructor(
    @InjectRepository(Survey2)
    private readonly surveyRepository: Repository<Survey2>,
    @InjectRepository(Survey2Part)
    private readonly partRepository: Repository<Survey2Part>,
    @InjectRepository(Survey2Question)
    private readonly questionRepository: Repository<Survey2Question>,
    @InjectRepository(Survey2QuestionAnswer)
    private readonly answerRepository: Repository<Survey2QuestionAnswer>,
    @InjectRepository(Survey2User)
    private readonly surveyUserRepository: Repository<Survey2User>,
    @InjectRepository(Survey2UserAnswer)
    private readonly userAnswerRepository: Repository<Survey2UserAnswer>,
    @InjectRepository(Survey2UserAnswerText)
    private readonly userAnswerTextRepository: Repository<Survey2UserAnswerText>,
  ) {}

  // ---------- Survey ----------

  async getSurveys(): Promise<{ surveys: Survey2[]; total: number }> {
    const surveys = await this.surveyRepository.find({
      where: { isDeleted: false },
      relations: ['parts'],
      order: { createdAt: 'DESC' },
    })

    for (const survey of surveys) {
      survey.userSurveyTotalNumber = await this.surveyUserRepository.count({
        where: { surveyId: survey.id, isDeleted: false },
      })
    }

    return { surveys, total: surveys.length }
  }

  async getSurveyById(id: string): Promise<Survey2> {
    const survey = await this.surveyRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['parts'],
    })
    if (!survey) throw new Error('Survey is not found')

    const parts = await this.partRepository.find({
      where: { surveyId: id, isDeleted: false },
      relations: ['questions'],
      order: { index: 'ASC' },
    })
    for (const part of parts) {
      const questions = await this.questionRepository.find({
        where: { partId: part.id, isDeleted: false },
        relations: ['answers'],
        order: { index: 'ASC' },
      })
      for (const question of questions) {
        question.answers = (question.answers ?? []).filter(
          (a) => !a.isDeleted,
        )
      }
      part.questions = questions
    }
    survey.parts = parts.sort((a, b) => a.index - b.index)

    return survey
  }

  async createSurvey(dto: Survey2CreateDto): Promise<Survey2> {
    const survey = this.surveyRepository.create({
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      display: dto.display ?? true,
    })
    return await this.surveyRepository.save(survey)
  }

  async updateSurvey(id: string, dto: Survey2UpdateDto): Promise<Survey2> {
    const survey = await this.surveyRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!survey) throw new Error('Survey is not found')

    return await this.surveyRepository.save({
      ...survey,
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      display: dto.display ?? survey.display,
    })
  }

  async updateSurveyDisplay(id: string, display: boolean): Promise<Survey2> {
    const survey = await this.surveyRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!survey) throw new Error('Survey is not found')

    survey.display = display
    return await this.surveyRepository.save(survey)
  }

  async deleteSurvey(id: string): Promise<Survey2> {
    const survey = await this.surveyRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!survey) throw new Error('Survey is not found')

    const answered = await this.countSurveyAnswers(id)
    if (answered > 0) {
      throw new Error('มีผู้ตอบแบบสอบถามนี้แล้ว ไม่สามารถลบได้')
    }

    survey.isDeleted = true
    return await this.surveyRepository.save(survey)
  }

  private async countSurveyAnswers(surveyId: string): Promise<number> {
    const parts = await this.partRepository.find({
      where: { surveyId, isDeleted: false },
      select: { id: true },
    })
    if (parts.length === 0) return 0

    const questions = await this.questionRepository.find({
      where: { partId: In(parts.map((p) => p.id)), isDeleted: false },
      select: { id: true },
    })
    if (questions.length === 0) return 0
    const questionIds = questions.map((q) => q.id)

    const answers = await this.answerRepository.find({
      where: { questionId: In(questionIds), isDeleted: false },
      select: { id: true },
    })

    const choiceCount =
      answers.length > 0
        ? await this.userAnswerRepository.count({
            where: { surveyAnswerId: In(answers.map((a) => a.id)), isDeleted: false },
          })
        : 0
    const textCount = await this.userAnswerTextRepository.count({
      where: { questionId: In(questionIds), isDeleted: false },
    })

    return choiceCount + textCount
  }

  // ---------- Part ----------

  async getParts(surveyId: string): Promise<Survey2Part[]> {
    return await this.partRepository.find({
      where: { surveyId, isDeleted: false },
      order: { index: 'ASC', createdAt: 'ASC' },
    })
  }

  async getPartById(id: string): Promise<Survey2Part> {
    const part = await this.partRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['questions'],
    })
    if (!part) throw new Error('Part is not found')

    part.questions = (part.questions ?? [])
      .filter((q) => !q.isDeleted)
      .sort((a, b) => a.index - b.index)
    return part
  }

  async createPart(dto: Survey2PartCreateDto): Promise<Survey2Part> {
    const survey = await this.surveyRepository.findOne({
      where: { id: dto.surveyId, isDeleted: false },
    })
    if (!survey) throw new Error('Survey is not found')

    const siblings = await this.partRepository.find({
      where: { surveyId: dto.surveyId, isDeleted: false },
      select: { index: true },
    })
    const maxIndex = siblings.reduce((m, p) => Math.max(m, p.index), 0)

    return await this.partRepository.save(
      this.partRepository.create({
        title: dto.title,
        surveyId: dto.surveyId,
        index: maxIndex + 1,
      }),
    )
  }

  async updatePart(id: string, title: string): Promise<Survey2Part> {
    const part = await this.partRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!part) throw new Error('Part is not found')

    part.title = title
    return await this.partRepository.save(part)
  }

  async updatePartDisplay(id: string, display: boolean): Promise<Survey2Part> {
    const part = await this.partRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!part) throw new Error('Part is not found')

    part.display = display
    return await this.partRepository.save(part)
  }

  async updatePartIndex(id: string, newIndex: number): Promise<Survey2Part> {
    const part = await this.partRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!part) throw new Error('Part is not found')

    const siblings = (
      await this.partRepository.find({
        where: { surveyId: part.surveyId, isDeleted: false },
        order: { index: 'ASC', createdAt: 'ASC' },
      })
    ).filter((p) => p.id !== part.id)

    newIndex = Math.max(1, Math.min(newIndex, siblings.length + 1))
    siblings.splice(newIndex - 1, 0, part)

    for (let i = 0; i < siblings.length; i++) {
      siblings[i].index = i + 1
    }
    await this.partRepository.save(siblings)

    return part
  }

  async deletePart(id: string): Promise<Survey2Part> {
    const part = await this.partRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['questions'],
    })
    if (!part) throw new Error('Part is not found')

    if ((part.questions ?? []).some((q) => !q.isDeleted)) {
      throw new Error('กรุณาลบคำถามทั้งหมดก่อน')
    }

    const answered = await this.countSurveyAnswers(part.surveyId)
    if (answered > 0) {
      throw new Error('มีผู้ตอบแบบสอบถามนี้แล้ว ไม่สามารถลบได้')
    }

    part.isDeleted = true
    const saved = await this.partRepository.save(part)

    await this.partRepository
      .createQueryBuilder()
      .update(Survey2Part)
      .set({ index: () => '"index" - 1' })
      .where(
        '"surveyId" = :surveyId AND "isDeleted" = false AND "index" > :index',
        { surveyId: part.surveyId, index: part.index },
      )
      .execute()

    return saved
  }

  // ---------- Question ----------

  async getQuestions(partId: string): Promise<Survey2Question[]> {
    const questions = await this.questionRepository.find({
      where: { partId, isDeleted: false },
      relations: ['answers'],
      order: { index: 'ASC' },
    })
    for (const question of questions) {
      question.answers = (question.answers ?? [])
        .filter((a) => !a.isDeleted)
        .sort((a, b) => a.index - b.index)
    }
    return questions
  }

  async getQuestionById(id: string): Promise<Survey2Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['answers'],
    })
    if (!question) throw new Error('Question is not found')

    const answers = (
      await this.answerRepository.find({
        where: { questionId: id, isDeleted: false },
        relations: ['userAnswers'],
      })
    ).sort((a, b) => a.index - b.index)

    for (const answer of answers) {
      answer.userAnswers = (answer.userAnswers ?? []).filter(
        (ua) => !ua.isDeleted,
      )
    }

    question.answers = answers
    question.userAnswerTexts = await this.userAnswerTextRepository.find({
      where: { questionId: id, isDeleted: false },
      relations: ['userSurvey'],
      order: { createdAt: 'DESC' },
    })
    question.isAnswered = await this.isQuestionAnswered(id)
    return question
  }

  private async isQuestionAnswered(questionId: string): Promise<boolean> {
    const answers = await this.answerRepository.find({
      where: { questionId, isDeleted: false },
      select: { id: true },
    })
    if (answers.length > 0) {
      const count = await this.userAnswerRepository.count({
        where: { surveyAnswerId: In(answers.map((a) => a.id)), isDeleted: false },
      })
      if (count > 0) return true
    }
    const textCount = await this.userAnswerTextRepository.count({
      where: { questionId, isDeleted: false },
    })
    return textCount > 0
  }

  async createQuestion(dto: Survey2QuestionCreateDto): Promise<Survey2Question> {
    const part = await this.partRepository.findOne({
      where: { id: dto.partId, isDeleted: false },
    })
    if (!part) throw new Error('Part is not found')

    const siblings = await this.questionRepository.find({
      where: { partId: dto.partId, isDeleted: false },
      select: { index: true },
    })
    const maxIndex = siblings.reduce((m, q) => Math.max(m, q.index), 0)

    const question = this.questionRepository.create({
      question: dto.question,
      imageUrl: dto.imageUrl,
      type: dto.type,
      answerType: dto.answerType ?? Survey2QuestionAnswerType.TEXT,
      condition: dto.condition ?? Survey2QuestionCondition.NOT_FIXED,
      conditionNumber: dto.conditionNumber ?? 0,
      required: dto.required ?? false,
      isUserAnswerText: dto.isUserAnswerText ?? false,
      isHasOther: dto.isHasOther ?? false,
      display: dto.display ?? true,
      partId: dto.partId,
      index: maxIndex + 1,
    })
    const saved = await this.questionRepository.save(question)

    if (dto.type !== Survey2QuestionType.TEXT && dto.answers?.length) {
      await this.saveAnswers(saved.id, dto.answers)
    }

    return this.getQuestionById(saved.id)
  }

  private async saveAnswers(
    questionId: string,
    answers: {
      id?: string
      answer?: string
      imageUrl?: string
      weight?: number
      isOther?: boolean
      isComment?: boolean
    }[],
  ): Promise<void> {
    const keepIds = answers.filter((a) => a.id).map((a) => a.id!)

    // ตัวเลือกเดิมที่ไม่ถูกส่งมา → soft delete
    const existing = await this.answerRepository.find({
      where: { questionId, isDeleted: false },
    })
    for (const old of existing) {
      if (!keepIds.includes(old.id)) {
        old.isDeleted = true
        await this.answerRepository.save(old)
      }
    }

    for (let i = 0; i < answers.length; i++) {
      const dto = answers[i]
      if (dto.id) {
        const current = existing.find((a) => a.id === dto.id)
        if (current) {
          current.answer = dto.answer ?? current.answer
          current.imageUrl = dto.imageUrl ?? null
          current.weight = dto.weight ?? current.weight
          current.isComment = dto.isComment ?? current.isComment
          current.index = i + 1
          await this.answerRepository.save(current)
        }
        continue
      }
      await this.answerRepository.save(
        this.answerRepository.create({
          questionId,
          answer: dto.answer,
          imageUrl: dto.imageUrl,
          weight: dto.weight ?? 0,
          isOther: dto.isOther ?? false,
          isComment: dto.isComment ?? false,
          index: i + 1,
        }),
      )
    }
  }

  async updateQuestion(
    id: string,
    dto: Survey2QuestionCreateDto,
  ): Promise<Survey2Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!question) throw new Error('Question is not found')

    if (dto.partId !== question.partId) {
      throw new Error('ไม่สามารถย้ายคำถามข้ามหมวดได้')
    }

    if (await this.isQuestionAnswered(id)) {
      throw new Error(
        'มีผู้ตอบคำถามนี้แล้ว ไม่สามารถแก้ไข เพิ่ม หรือลดตัวเลือกคำตอบได้',
      )
    }

    await this.questionRepository.save({
      ...question,
      question: dto.question,
      imageUrl: dto.imageUrl,
      type: dto.type,
      answerType: dto.answerType ?? Survey2QuestionAnswerType.TEXT,
      condition: dto.condition ?? Survey2QuestionCondition.NOT_FIXED,
      conditionNumber: dto.conditionNumber ?? 0,
      required: dto.required ?? false,
      isUserAnswerText: dto.isUserAnswerText ?? false,
      isHasOther: dto.isHasOther ?? false,
      display: dto.display ?? question.display,
    })

    if (dto.type !== Survey2QuestionType.TEXT) {
      await this.saveAnswers(id, dto.answers ?? [])
    }

    return this.getQuestionById(id)
  }

  async updateQuestionDisplay(
    id: string,
    display: boolean,
  ): Promise<Survey2Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!question) throw new Error('Question is not found')

    question.display = display
    return await this.questionRepository.save(question)
  }

  async updateQuestionIndex(
    id: string,
    newIndex: number,
  ): Promise<Survey2Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!question) throw new Error('Question is not found')

    const siblings = (
      await this.questionRepository.find({
        where: { partId: question.partId, isDeleted: false },
        order: { index: 'ASC', createdAt: 'ASC' },
      })
    ).filter((q) => q.id !== question.id)

    newIndex = Math.max(1, Math.min(newIndex, siblings.length + 1))
    siblings.splice(newIndex - 1, 0, question)

    for (let i = 0; i < siblings.length; i++) {
      siblings[i].index = i + 1
    }
    await this.questionRepository.save(siblings)

    return question
  }

  async deleteQuestion(id: string): Promise<Survey2Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!question) throw new Error('Question is not found')

    if (await this.isQuestionAnswered(id)) {
      throw new Error('มีผู้ตอบคำถามนี้แล้ว ไม่สามารถลบได้')
    }

    question.isDeleted = true
    const saved = await this.questionRepository.save(question)

    await this.questionRepository
      .createQueryBuilder()
      .update(Survey2Question)
      .set({ index: () => '"index" - 1' })
      .where(
        '"partId" = :partId AND "isDeleted" = false AND "index" > :index',
        { partId: question.partId, index: question.index },
      )
      .execute()

    return saved
  }

  // ---------- ผู้ตอบ ----------

  async getSurveyUsers(surveyId: string): Promise<Survey2User[]> {
    return await this.surveyUserRepository
      .createQueryBuilder('surveyUser')
      .leftJoinAndSelect('surveyUser.personnel', 'personnel')
      .where('surveyUser.surveyId = :surveyId AND surveyUser.isDeleted = false', {
        surveyId,
      })
      .orderBy('surveyUser.createdAt', 'DESC')
      .getMany()
  }

  // ---------- สรุปผล ----------

  async getSurveyResults(surveyId: string) {
    const survey = await this.getSurveyById(surveyId)

    const respondents = await this.getSurveyUsers(surveyId)
    const respondentIds = new Set(respondents.map((r) => r.personnelId))

    const totalPersonnel = await this.surveyUserRepository.manager.find(
      Personnel,
      { where: { isDeleted: false }, select: ['id', 'rank', 'firstName', 'lastName', 'groupId'] },
    )
    const personnelById = new Map(totalPersonnel.map((p) => [p.id, p]))
    const personnelName = (p?: Pick<Personnel, 'rank' | 'firstName' | 'lastName'> | null) =>
      p ? `${p.rank ?? ''} ${p.firstName} ${p.lastName}`.trim() : '-'
    const nonRespondents = totalPersonnel.filter((p) => !respondentIds.has(p.id))

    // นับตอบต่อ choice: join userSurvey เพื่อกรองด้วย surveyId
    const choiceCounts = await this.userAnswerRepository
      .createQueryBuilder('ua')
      .select('ua.surveyAnswerId', 'answerId')
      .addSelect('count(*)', 'cnt')
      .innerJoin('ua.userSurvey', 'us')
      .where('us.surveyId = :surveyId AND us.isDeleted = false AND ua.isDeleted = false', {
        surveyId,
      })
      .groupBy('ua.surveyAnswerId')
      .getRawMany<{ answerId: string; cnt: string }>()
    const countByAnswer = new Map(choiceCounts.map((c) => [c.answerId, Number(c.cnt)]))

    // จำนวนคนที่ตอบคำถามนั้น (distinct user_survey) + comment ("อื่นๆ โปรดระบุ")
    const perQuestion = await this.userAnswerRepository
      .createQueryBuilder('ua')
      .select('q.id', 'questionId')
      .addSelect('count(distinct ua.userSurveyId)', 'answered')
      .addSelect('count(ua.answer)', 'comments')
      .innerJoin('ua.userSurvey', 'us')
      .innerJoin(Survey2QuestionAnswer, 'sa', 'sa.id = ua.surveyAnswerId')
      .innerJoin(Survey2Question, 'q', 'q.id = sa.questionId')
      .where('us.surveyId = :surveyId AND us.isDeleted = false AND ua.isDeleted = false', {
        surveyId,
      })
      .groupBy('q.id')
      .getRawMany<{ questionId: string; answered: string; comments: string }>()
    const statsByQuestion = new Map(
      perQuestion.map((q) => [q.questionId, { answered: Number(q.answered), comments: Number(q.comments) }]),
    )

    const textRows = await this.userAnswerTextRepository.find({
      where: { isDeleted: false, userSurvey: { surveyId, isDeleted: false } },
      order: { createdAt: 'ASC' },
    })

    const commentRows = await this.userAnswerRepository.find({
      where: {
        isDeleted: false,
        answer: Not(''), // NULL ถูกกรองเอง (NULL <> '' ไม่จริง)
        userSurvey: { surveyId, isDeleted: false },
      },
      order: { createdAt: 'ASC' },
    })

    // map: answerId → questionId (สำหรับจัด comment เข้าคำถาม)
    const answerQuestionMap = new Map<string, string>()
    for (const part of survey.parts ?? []) {
      for (const question of part.questions ?? []) {
        for (const answer of question.answers ?? []) {
          answerQuestionMap.set(answer.id, question.id)
        }
      }
    }

    const parts = survey.parts
      .filter((part) => part.display)
      .map((part) => ({
        id: part.id,
        title: part.title,
        questions: (part.questions ?? [])
          .filter((question) => question.display)
          .map((question) => {
            const stats = statsByQuestion.get(question.id)
            const answeredCount = stats?.answered ?? 0
            const base = respondents.length || 1

            const textAnswers = textRows
              .filter((t) => t.questionId === question.id)
              .map((t) => ({
                id: t.id,
                text: t.answer,
                personnelName: personnelName(personnelById.get(t.personnelId)),
                createdAt: t.createdAt,
              }))

            const comments = commentRows
              .filter((c) => answerQuestionMap.get(c.surveyAnswerId) === question.id)
              .map((c) => ({
                id: c.id,
                text: c.answer ?? '',
                personnelName: personnelName(personnelById.get(c.personnelId)),
              }))

            return {
              id: question.id,
              question: question.question,
              type: question.type,
              required: question.required,
              answeredCount,
              choices: (question.answers ?? [])
                .filter((a) => a.display)
                .sort((a, b) => a.index - b.index)
                .map((a) => {
                  const count = countByAnswer.get(a.id) ?? 0
                  return {
                    id: a.id,
                    answer: a.answer,
                    imageUrl: a.imageUrl,
                    weight: a.weight,
                    isOther: a.isOther,
                    count,
                    percent: Math.round((count / base) * 100),
                  }
                }),
              textAnswers,
              comments,
            }
          }),
      }))

    return {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        startDate: survey.startDate,
        endDate: survey.endDate,
      },
      totals: {
        respondents: respondents.length,
        totalPersonnel: totalPersonnel.length,
        noResponse: nonRespondents.length,
      },
      parts,
      respondents: respondents.map((r) => ({
        id: r.id,
        personnelId: r.personnelId,
        name: personnelName(r.personnel),
        rank: r.personnel?.rank ?? null,
        submittedAt: r.createdAt,
      })),
      nonRespondents: nonRespondents.map((p) => ({
        id: p.id,
        name: personnelName(p),
        rank: p.rank ?? null,
      })),
    }
  }

  private answerByIdFromSurvey(
    survey: Survey2,
    answerId: string,
  ): Survey2QuestionAnswer | undefined {
    for (const part of survey.parts ?? []) {
      for (const question of part.questions ?? []) {
        const found = (question.answers ?? []).find((a) => a.id === answerId)
        if (found) return found
      }
    }
    return undefined
  }

  // ---------- ฝั่งผู้ใช้ ----------

  async getLiveSurveys(personnelId: string): Promise<Survey2[]> {
    const now = new Date()
    const surveys = await this.surveyRepository
      .createQueryBuilder('survey')
      .where('survey.isDeleted = false AND survey.display = true')
      .andWhere('survey.startDate <= :now AND survey.endDate >= :now', { now })
      .orderBy('survey.createdAt', 'DESC')
      .getMany()

    // เฉพาะ survey ที่มีคำถามที่มองเห็นได้จริง
    const visible: Survey2[] = []
    for (const survey of surveys) {
      const count = await this.countVisibleQuestions(survey.id)
      if (count > 0) visible.push(survey)
    }

    const answered = await this.surveyUserRepository.find({
      where: { personnelId, isDeleted: false },
      select: { surveyId: true },
    })
    const answeredIds = new Set(answered.map((a) => a.surveyId))
    for (const survey of visible) {
      survey.isAnswered = answeredIds.has(survey.id)
    }

    return visible
  }

  private async countVisibleQuestions(surveyId: string): Promise<number> {
    const parts = await this.partRepository.find({
      where: { surveyId, isDeleted: false, display: true },
      select: { id: true },
    })
    if (parts.length === 0) return 0

    return await this.questionRepository.count({
      where: { partId: In(parts.map((p) => p.id)), isDeleted: false, display: true },
    })
  }

  async getSurveyForUser(id: string, personnelId: string): Promise<Survey2> {
    const survey = await this.surveyRepository.findOne({
      where: { id, isDeleted: false, display: true },
    })
    if (!survey) throw new Error('Survey is not found')

    const now = new Date()
    if (survey.startDate > now || survey.endDate < now) {
      throw new Error('แบบสอบถามนี้ไม่อยู่ในช่วงเวลาที่ตอบได้')
    }

    const parts = await this.partRepository.find({
      where: { surveyId: id, isDeleted: false, display: true },
      order: { index: 'ASC' },
    })
    for (const part of parts) {
      const questions = await this.questionRepository.find({
        where: { partId: part.id, isDeleted: false, display: true },
        relations: ['answers'],
        order: { index: 'ASC' },
      })
      for (const question of questions) {
        question.answers = (question.answers ?? [])
          .filter((a) => !a.isDeleted && a.display)
          .sort((a, b) => a.index - b.index)
      }
      part.questions = questions
    }
    survey.parts = parts

    const userSurvey = await this.surveyUserRepository.findOne({
      where: { surveyId: id, personnelId, isDeleted: false },
    })
    survey.isAnswered = !!userSurvey

    return survey
  }

  async submitSurvey(
    personnelId: string,
    dto: Survey2SubmitDto,
  ): Promise<Survey2User> {
    const survey = await this.surveyRepository.findOne({
      where: { id: dto.surveyId, isDeleted: false, display: true },
    })
    if (!survey) throw new Error('ไม่พบแบบสอบถามนี้')

    const now = new Date()
    if (survey.startDate > now || survey.endDate < now) {
      throw new Error('แบบสอบถามนี้ไม่อยู่ในช่วงเวลาที่ตอบได้')
    }

    const existing = await this.surveyUserRepository.findOne({
      where: { surveyId: dto.surveyId, personnelId, isDeleted: false },
    })
    if (existing) throw new Error('ท่านได้ทำแบบสอบถามนี้ไปแล้ว')

    const validation = await this.buildValidation(dto.surveyId)

    // ตรวจ answerId/questionId ต้อง active
    for (const item of dto.answers) {
      if (!validation.answerToQuestion.has(item.answerId)) {
        throw new Error('รูปแบบคำตอบไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง')
      }
    }
    for (const item of dto.answerTexts) {
      if (!validation.activeQuestions.has(item.questionId)) {
        throw new Error('รูปแบบคำตอบไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง')
      }
    }

    // ตรวจครบตามเงื่อนไขคำถาม
    const selectedByQuestion = new Map<string, string[]>()
    for (const item of dto.answers) {
      const { question } = validation.answerToQuestion.get(item.answerId)!
      selectedByQuestion.set(question.id, [
        ...(selectedByQuestion.get(question.id) ?? []),
        item.answerId,
      ])
    }
    const textByQuestion = new Map<string, string>()
    for (const item of dto.answerTexts) {
      textByQuestion.set(item.questionId, (item.answer ?? '').trim())
    }

    const missing: string[] = []
    for (const question of validation.activeQuestions.values()) {
      if (question.type === Survey2QuestionType.TEXT) {
        if (question.required && !textByQuestion.get(question.id)) {
          missing.push(question.question)
        }
        continue
      }
      const selected = selectedByQuestion.get(question.id) ?? []
      if (selected.length === 0) {
        missing.push(question.question)
        continue
      }
      if (
        question.type === Survey2QuestionType.MULTI_SELECT &&
        question.conditionNumber > 0
      ) {
        if (
          question.condition === 'less_than' &&
          selected.length > question.conditionNumber
        ) {
          throw new Error(
            `คำถาม "${question.question}" เลือกได้ไม่เกิน ${question.conditionNumber} ข้อ`,
          )
        }
        if (
          question.condition === 'more_than' &&
          selected.length < question.conditionNumber
        ) {
          throw new Error(
            `คำถาม "${question.question}" ต้องเลือกอย่างน้อย ${question.conditionNumber} ข้อ`,
          )
        }
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `กรุณาตอบคำถามให้ครบก่อนส่ง ยังมีอีก ${missing.length} ข้อ: ${missing.join(' / ')}`,
      )
    }

    // บันทึก
    const userSurvey = await this.surveyUserRepository.save(
      this.surveyUserRepository.create({
        surveyId: dto.surveyId,
        personnelId,
      }),
    )

    if (dto.answers.length > 0) {
      await this.userAnswerRepository.save(
        dto.answers.map((item) =>
          this.userAnswerRepository.create({
            surveyAnswerId: item.answerId,
            personnelId,
            answer: item.answer?.trim() || null,
            userSurveyId: userSurvey.id,
          }),
        ),
      )
    }
    if (dto.answerTexts.length > 0) {
      await this.userAnswerTextRepository.save(
        dto.answerTexts
          .filter((item) => (item.answer ?? '').trim())
          .map((item) =>
            this.userAnswerTextRepository.create({
              questionId: item.questionId,
              personnelId,
              answer: item.answer!.trim(),
              userSurveyId: userSurvey.id,
            }),
          ),
      )
    }

    return userSurvey
  }

  private async buildValidation(surveyId: string): Promise<SubmitValidation> {
    const parts = await this.partRepository.find({
      where: { surveyId, isDeleted: false, display: true },
      select: { id: true },
    })

    const activeQuestions = new Map<string, Survey2Question>()
    const answerToQuestion = new Map<
      string,
      { answer: Survey2QuestionAnswer; question: Survey2Question }
    >()

    for (const part of parts) {
      const questions = await this.questionRepository.find({
        where: { partId: part.id, isDeleted: false, display: true },
      })
      for (const question of questions) {
        activeQuestions.set(question.id, question)
        const answers = await this.answerRepository.find({
          where: {
            questionId: question.id,
            isDeleted: false,
            display: true,
          },
        })
        for (const answer of answers) {
          answerToQuestion.set(answer.id, { answer, question })
        }
      }
    }

    return { activeQuestions, answerToQuestion }
  }
}
