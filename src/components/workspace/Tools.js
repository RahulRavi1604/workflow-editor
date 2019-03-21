import Base from '../base/Base';

export default class Tool extends Base {
  constructor(props) {
    super();
    this.props = props;
  }

  create() {
    const tools = [this.ce('div', {
      style: 'position: absolute; top: 15px; right: 35px; width: 25px; height: 30px;',
    }, this.ce('button', {
      class: 'navigation-button',
      keys: {
        innerHTML: "&#9974",
        title: 'Reset Zoom'
      },
      on: {
        click: this.props.reset.bind(this)
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 55px; right: 35px;  width: 25px; height: 30px;',
    }, this.ce('button', {
      class: 'navigation-button',
      keys: {
        innerHTML: "&#10133",
        title: 'Zoom In'
      },
      on: {
        click: (e) => this.props.zoom(e, "zoomIn")
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 84px; right: 35px;  width: 25px; height: 30px;',
    }, this.ce('button', {
      class: 'navigation-button',
      keys: {
        innerHTML: "&#10134",
        title: 'Zoom Out'
      },
      on: {
        click: (e) => this.props.zoom(e, "zoomOut")
      }
    })),]
    return tools;
  }
}