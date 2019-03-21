export class User {
  _id: string;
  email: string;
  name: string;
  subscriptions: string;
  subscribers: string;
  exp: number;
  iat: number;

  constructor(data) {
    this._id = data._id;
    this.email = data.email;
    this.name = data.name;
    this.exp = data.exp;
    this.iat = data.iat;
    this.subscriptions = data.subscriptions;
    this.subscribers = data.subscribers;
  }
}
