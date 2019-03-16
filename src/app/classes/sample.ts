export class Sample {
  _id: string;
  name: string;
  author: string;
  file_id: string;
  tags: Array<string>;
  genres: Array<string>;
  published: Boolean;
  metadata: {
    upvotes: Number;
    downvotes: Number;
  };

  constructor(data) {
    this._id = data._id;
    this.name = data.name;
    this.author = data.author;
    this.file_id = data.file_id;
    this.tags = data.tags;
    this.genres = data.genres;
    this.published = data.published;
    this.metadata = data.metadata;
  }
}
