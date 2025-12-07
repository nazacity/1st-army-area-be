import * as bcrypt from 'bcrypt';

export class Crypto {
  static hash(text) {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(text, salt);
  }

  static compare(text, hash) {
    return bcrypt.compareSync(text, hash);
  }
}
