import Circle from '../shapes/Circle';

export default class Event extends Circle {
  static schema() {
    return Circle.schema({
      key: 'event',
      label: 'event',
      type: 'event'
    });
  }

  static design() {
    return Circle.design();
  }

  get baseSchema() {
    return Event.schema();
  }

  get baseDesign() {
    return Event.design();
  }
}
