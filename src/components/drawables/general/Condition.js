import Rhombus from '../shapes/Rhombus';

export default class Condition extends Rhombus {
  static schema() {
    return Rhombus.schema({
      key: 'condition',
      label: 'condition',
      type: 'condition'
    });
  }

  static design() {
    return Rhombus.design();
  }

  get baseSchema() {
    return Condition.schema();
  }

  get baseDesign() {
    return Condition.design();
  }
}
