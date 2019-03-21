import Base from '../base/Base';
import Modal from '../modal/Modal';
import Tools from './Tools';
import './workspace.css';
export default class Workspace extends Base {
  constructor() {
    super();
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    }
    this.workspace;
    this.offset = {};
    this.element;
    this.component;
    this.line;
    this.lineElement;
    this.highlighted;
    this.menuOptions;
    this.flows = [{
        "id": "comp-867607",
        "data": {
          "formId": "id for purchase order"
        },
        "key": "event",
        "label": "Track PO",
        "out": [{
          "id": "linecomp-867607-0",
          "direction": "bottom",
          "destination": "comp-513476",
          "position": {
            "x": 209.5,
            "y": 157.5
          },
          "points": [{
            "x": 208.5,
            "y": 250
          }],
          "completed": false,
          "initialPoints": [{
              "x": 208.5,
              "y": 158
            },
            {
              "x": 208.5,
              "y": 250
            }
          ],
          "crossed": false
        }],
        "in": [],
        "position": {
          "x": 165,
          "y": 65
        },
        "type": "event"
      },
      {
        "id": "comp-513476",
        "data": {
          "rule": "rule for purchased"
        },
        "key": "condition",
        "label": "If Purchased?",
        "out": [{
          "id": "linecomp-513476-0",
          "direction": "right",
          "destination": "comp-465141",
          "position": {
            "x": 282.5,
            "y": 310
          },
          "points": [{
            "x": 380,
            "y": 310
          }],
          "completed": false,
          "condition": "Yes",
          "initialPoints": [{
              "x": 282.5,
              "y": 310
            },
            {
              "x": 380,
              "y": 310
            }
          ],
          "crossed": false
        }],
        "in": [{
          "direction": "top",
          "source": "comp-867607"
        }],
        "position": {
          "x": 165,
          "y": 265
        },
        "type": "condition"
      },
      {
        "id": "comp-465141",
        "data": {
          "formId": "id for invoice"
        },
        "key": "action",
        "label": "Create Invoice",
        "out": [{
          "id": "linecomp-465141-0",
          "direction": "bottom",
          "destination": "comp-067317",
          "position": {
            "x": 423.5,
            "y": 333
          },
          "points": [{
            "x": 423.5,
            "y": 409
          }],
          "completed": false,
          "initialPoints": [{
              "x": 423.5,
              "y": 333
            },
            {
              "x": 423.5,
              "y": 409
            }
          ],
          "crossed": false
        }],
        "in": [{
          "direction": "left",
          "source": "comp-513476"
        }],
        "position": {
          "x": 380,
          "y": 290
        },
        "type": "action"
      },
      {
        "id": "comp-067317",
        "data": {
          "rule": "rule for invoice detail"
        },
        "key": "condition",
        "label": "Is having ID?",
        "out": [{
          "id": "linecomp-067317-0",
          "direction": "right",
          "destination": "comp-171995",
          "position": {
            "x": 492.5,
            "y": 470.5
          },
          "points": [{
            "x": 622,
            "y": 470.5
          }],
          "completed": false,
          "condition": "Yes",
          "initialPoints": [{
              "x": 492.5,
              "y": 470.5
            },
            {
              "x": 622,
              "y": 470.5
            }
          ],
          "crossed": false
        }],
        "in": [{
          "direction": "top",
          "source": "comp-465141"
        }],
        "position": {
          "x": 380,
          "y": 430
        },
        "type": "condition"
      },
      {
        "id": "comp-171995",
        "data": {
          "formId": "id for invoice-detail"
        },
        "key": "action",
        "label": "Create Invoice-detail",
        "out": [],
        "in": [{
          "direction": "left",
          "source": "comp-067317"
        }],
        "position": {
          "x": 620,
          "y": 455
        },
        "type": "action"
      }
    ];
    this.changes = [];
    this.undoIndex = 0;
    this.selectMode = 'Move';
    this.selectedComp = [];
    document.addEventListener("componentUpdate", this.componentUpdate.bind(this), false);
  }

  componentUpdate(e) {
    console.log('flows', this.flows);
  }

  reset(e) {
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    };
    this.workspace.setAttribute('style', '');
  }

  zoom(e, action) {
    var delta;
    const layer = {
      x: e.layerX,
      y: e.layerY
    }
    if (action) {
      const rect = this.workspace.getBoundingClientRect();
      layer.x = (rect.width / this.current.zoom) / 2;
      layer.y = (rect.height / this.current.zoom) / 2;
      delta = action === 'zoomIn' ? 120 : -120;
    } else {
      delta = (e.wheelDelta || -e.detail);
    }
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
    var oz = this.current.zoom,
      nz = this.current.zoom + (delta < 0 ? -0.2 : 0.2);
    if (nz < 1 || nz > 15) {
      return;
    }
    // calculate click at current zoom
    var ix = (layer.x - this.current.x) / oz,
      iy = (layer.y - this.current.y) / oz,
      // calculate click at new zoom
      nx = ix * nz,
      ny = iy * nz,
      // move to the difference
      // make sure we take mouse pointer offset into account!
      cx = (ix + (layer.x - ix) - nx),
      cy = (iy + (layer.y - iy) - ny);
    // update current
    this.current.zoom = nz;
    this.current.x = cx;
    this.current.y = cy;
    // make sure we scale before translate!
    const event = new CustomEvent("onZoom", {
      detail: {
        zoom: nz
      }
    });
    document.dispatchEvent(event);
    this.workspace.style.transform = `translate(${cx}px, ${cy}px) scale(${nz})`;
  };

  allowDrop(e) {
    e.preventDefault();
  }

  drop(e) {
    var droppedId = e.dataTransfer.getData('data');
    e.preventDefault();
    var component = {
      id: this.randomString('comp', 'n'),
      data: {},
      key: droppedId,
      label: droppedId,
      out: [],
      in: [],
      position: {
        x: (e.layerX - (this.current.x + 50)) / this.current.zoom,
        y: (e.layerY - (this.current.y + 25)) / this.current.zoom
      },
      type: droppedId
    };
    component.position.x = Math.round(component.position.x / 5) * 5;
    component.position.y = Math.round(component.position.y / 5) * 5;
    if (component.type === 'condition') {
      component.position.x += 20;
      component.position.y += 20;
    }
    this.flows.push(component);
    this.addNewChanges(this.flows);
    this.workspace.appendChild(this.placeComponent(component));
    if (this.modal) {
      this.modal.remove();
    }
    this.modal = new Modal(component).open()
    this.workspace.parentNode.appendChild(this.modal);
  }

  placeComponent(comp) {
    this.component = comp;
    var wrapperStyle = 'position: absolute; border: #faebd7;';
    var compStyle =
      'position: relative; width: 100px; height: 100px; color: black; display: flex; align-items: center; justify-content: center;'
    if (comp.type === 'event') {
      wrapperStyle += `border-radius: 50%; transform: translate(${comp.position.x}px, ${comp.position.y}px)`;
      compStyle += 'border-radius: 50%';
    } else if (comp.type === 'action') {
      wrapperStyle += `transform: translate(${comp.position.x}px, ${comp.position.y}px)`;
      compStyle += 'height: 50px';
    } else if (comp.type === 'condition') {
      wrapperStyle +=
        `transform: translate(${comp.position.x}px, ${comp.position.y}px) rotate(45deg)`;
    }
    var compChildren = [
      this.ce('span', {
        id: 'label-' + `${this.component.id}`,
        style: `text-transform: capitalize;
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        overflow: hidden;
        white-space: nowrap;
        ${comp.type === 'condition' ? 'transform: rotate(-45deg)': ''}`,
        keys: {
          innerHTML: comp.label
        }
      })
    ];
    // compChildren.push(this.getAvailableDirections(comp).map((line) => this.addNode(line)));
    comp.out.map(line => this.createLineGroup(line));

    var wrappedComp = this.ce('div', {
      id: comp.id,
      style: wrapperStyle,
      keys: {
        title: comp.label
      },
      on: {
        dblclick: this.openModal.bind(this),
        mouseover: this.showNodes.bind(this),
        mouseleave: this.hideNodes.bind(this)
      }
    }, this.ce('div', {
      class: 'drag-item',
      style: compStyle
    }, compChildren));
    this.component = null;
    return wrappedComp;
  }

  openModal(e) {
    const componentId = e ? e.target.parentElement.id : this.component.id;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.component = this.getComponentById(this.flows, componentId);
    this.workspace.parentNode.appendChild(new Modal(this.component).open());
  }

  showSelectionNodes(component, element) {
    if (component.type === 'condition') {
      if (!(this.lineElement && this.line) && component.out && component.out.length >= 2) {
        return;
      } else if (this.lineElement && this.line && component.in.length >= 1) {
        return;
      }
    }
    ['top', 'right', 'bottom', 'left'].map(direction => {
      this.component = component;
      element.appendChild(this.addNode(direction, false, true));
      element.style.backgroundColor = '#dbdbdb';
    });
    this.component = null;
  }

  showNodes(e) {
    e.preventDefault();
    const componentId = e.target.parentElement.id;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.tempComp = this.getComponentById(this.flows, componentId);
    if (this.tempComp.type === 'condition') {
      if (!(this.lineElement && this.line) && this.tempComp.out && this.tempComp.out.length >= 2) {
        return;
      } else if (this.lineElement && this.line && this.tempComp.in.length >= 1) {
        return;
      }
    }
    let tempDirections = ['top', 'right', 'bottom', 'left'];
    if (this.lineElement) {
      const currPointIndex = this.line.points.length - 1;
      const currentLineDirection = this.getLineDirection(this.line.points[currPointIndex],
        currPointIndex === 0 ? this.line.position : this.line.points[currPointIndex - 1]);
      tempDirections = [this.getOppositeDirection(currentLineDirection)];
    }
    // this.getAvailableDirections(this.tempComp).map(direction => {
    //   if (tempDirections.indexOf(direction) !== -1) {
    //     tempDirections.splice(tempDirections.indexOf(direction), 1)
    //   }
    // });
    tempDirections.map(direction => {
      e.target.appendChild(this.addNode(direction, 'temp'));
    });
  }

  getAvailableDirections(comp) {
    const availableDirections = [...comp.out.map(line => (line.direction)), ...comp.in.map(line => (line.direction))];
    return availableDirections.filter((direction, index) => availableDirections.indexOf(direction) === index);
  }

  hideNodes(e) {
    e.preventDefault();
    if (e.target.id.indexOf('comp') !== 0) {
      return;
    }
    const tempNodes = e.target.firstChild.getElementsByClassName('temp');
    while (tempNodes.length > 0) {
      tempNodes[0].remove();
    }
    this.tempComp = null;
  }

  addNode(direction, isTemp, isSelected) {
    const comp = isTemp ? this.tempComp : this.component;
    var nodeStyle =
      'width: 15px; height: 15px; position: absolute; z-index: -1; border-radius: 50%; cursor: crosshair;';
    const calc = comp.type === 'condition' ? 0 : 50;
    if (direction === 'top') {
      nodeStyle += `top: -8px; left: calc(${calc}% - 8px);`;
    } else if (direction === 'right') {
      nodeStyle += `right: -8px; top: calc(${calc}% - 8px);`;
    } else if (direction === 'bottom') {
      nodeStyle += `bottom: -8px; right: calc(${calc}% - 8px);`;
    } else {
      nodeStyle += `left: -8px; bottom: calc(${calc}% - 8px);`;
    }
    var createdNode = this.ce('div', {
      id: `node-${comp.id}-${direction}`,
      class: 'node-' + `${isTemp ? isTemp+' temp': comp.id}` + `${isSelected ? ' selected ' : ''}`,
      style: nodeStyle,
      ['data-comp']: comp.id,
      ['data-direction']: direction
    }, this.ce('div', {
      style: 'width: 100%; height: 100%; position: relative; background: blue; border-radius: 50%; cursor: crosshair;',
      on: {
        mouseover: this.highlight.bind(this),
        mouseout: this.highlight.bind(this)
      }
    }));
    return createdNode;
  }

  addConditionLabel(line, isTemp) {
    if (!this.component) {
      return this.ce('span');
    }
    const labelText = line.condition || this.component.out.length === 0 ? 'Yes' : 'No';
    line.condition = labelText;
    let transformX = line.position.x;
    let transformY = line.position.y;
    if (line.direction === 'top') {
      transformX -= 20;
      transformY -= 5;
    } else if (line.direction === 'right') {
      transformX += 20;
      transformY -= 5;
    } else if (line.direction === 'bottom') {
      transformX += 25;
      transformY -= 5;
    } else {
      transformX -= 20;
      transformY -= 3;
    }
    var createdLabel = this.ce('text', {
      id: 'condition',
      class: 'condition-' + `${isTemp ? isTemp+' temp': this.component.id}`,
      x: transformX,
      y: transformY,
      fill: 'red',
      ['data-direction']: line.direction,
      nativeStyle: {
        'font-size': 'inherit',
        fill: 'black',
        stroke: 'none',
        'text-anchor': 'middle',
      },
      keys: {
        innerHTML: labelText
      }
    });
    return createdLabel;
  }

  highlight(e) {
    e.preventDefault();
    if (!this.highlighted) {
      e.target.style.transform = 'scale(1.5)';
      this.highlighted = e.target.parentElement;
      this.highlighted.style.zIndex = 1;
      return;
    }
    e.target.style.transform = 'scale(1)';
    this.highlighted.style.zIndex = -1;
    this.highlighted = null;
  }

  mouseDown(e) {
    e.preventDefault();
    // check mouse click button is left
    if (e.which !== 1) {
      return;
    }
    if (this.lineElement) {
      this.lineElement.remove();
      return;
    }
    if (e.target.id.indexOf('condition') === 0) {
      e.stopPropagation();
      return;
    }
    this.setElemByEvent(e);
    if (this.element.id.indexOf('comp') !== 0 && this.selectedComp.length) {
      this.selectedComp.forEach((component) => {
        const element = this.getElementById(component.id);
        element.style.backgroundColor = '#ffff';
        element.firstChild.style.backgroundColor = '#ffff';
        const tempNodes = element.firstChild.getElementsByClassName('selected');
        while (tempNodes.length > 0) {
          tempNodes[0].remove();
        }
      });
      this.selectedComp = [];
    }
    if (this.element.id.indexOf('workspace') === 0) {
      if (this.selectMode === 'Move') {
        this.element.style.cursor = 'grabbing';
        this.initWorkspaceMove(e);
      } else {
        this.initMultiSelect(e);
      }
    } else if (this.element.id.indexOf('comp') === 0) {
      for (let i = 0; i < this.flows.length; i++) {
        if (this.flows[i].id === this.element.id) {
          this.component = this.flows[i];
          break;
        }
      }
      this.element.style.cursor = 'grabbing';
      this.initCompMove(e);
    } else if (this.element.id.indexOf('node') === 0) {
      this.component = this.getComponentById(this.flows, this.element.dataset.comp)
      // e.target.parentElement.classList.remove('temp');
      this.initLineDraw(e);
    }
  }

  initMultiSelect(e) {
    this.selector = {
      x: e.layerX,
      y: e.layerY
    };
    this.ac(this.svg, this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'rect'
    }, {
      id: 'selector',
      fill: '#abdbff',
      stroke: 'black',
      ['stroke-dasharray']: e ? '2' : '',
      strokeWidth: 2,
      opacity: 0.5,
      nativeStyle: {
        x: this.selector.x,
        y: this.selector.y,
        width: 0,
        height: 0
      }
    }));
  }

  moveSelector(e) {
    const start = {
      ...this.selector
    };
    const currentPosition = {
      x: e.layerX,
      y: e.layerY
    }
    const offset = {
      x: currentPosition.x - start.x,
      y: currentPosition.y - start.y
    };
    if (offset.x < 0) {
      start.x = currentPosition.x;
      offset.x = Math.abs(offset.x);
    }
    if (offset.y < 0) {
      start.y = currentPosition.y;
      offset.y = Math.abs(offset.y);
    }
    this.ce(this.svg.querySelector('#selector'), {
      nativeStyle: {
        x: start.x,
        y: start.y,
        width: offset.x,
        height: offset.y
      }
    });
  }

  endSelection(e) {
    const selector = this.svg.querySelector('#selector');
    if (selector) {
      selector.remove();
    }
    const initial = {
      x: Number(selector.style.x),
      y: Number(selector.style.y)
    };
    const final = {
      x: Number(selector.style.width.split('px')[0]) + initial.x,
      y: Number(selector.style.height.split('px')[0]) + initial.y
    };
    this.flows.forEach(component => {
      if (component.position.x >= initial.x && component.position.x <= final.x &&
        component.position.y >= initial.y && component.position.y <= final.y) {
        const element = this.getElementById(component.id).firstChild;
        this.showSelectionNodes(component, element);
        if (!this.selectedComp.includes(component)) {
          this.selectedComp.push(component);
        }
      }
    });
    this.selector = null;
  }
  mouseMove(e) {
    if (!this.element) {
      return;
    }
    if (this.element.id.indexOf('workspace') === 0) {
      if (this.selector && this.selectMode === 'Select') {
        this.moveSelector(e);
      } else {
        this.moveWorkspace(e);
      }
    } else if (this.element.id.indexOf('comp') === 0) {
      if (this.selectedComp.length) {
        this.selectedComp.forEach(component => {
          this.component = component;
          this.element = this.getElementById(component.id);
          this.moveComp(e, true);
        });
        this.selector = {
          x: e.layerX,
          y: e.layerY
        }
        this.component = null;
      } else {
        this.moveComp(e);
      }
    } else if (this.element.id.indexOf('node') === 0) {
      this.trackLinePoints(e);
    }
  }

  mouseEnd(e) {
    if (!this.element) {
      return;
    }
    if (this.element.id.indexOf('workspace') === 0) {
      if (this.selector && this.selectMode === 'Select') {
        this.endSelection(e);
      } else {
        this.element.style.cursor = 'default';
      }
      this.endWorkspaceMove(e);
      this.addNewChanges(this.flows);
    } else if (this.element.id.indexOf('comp') === 0) {
      this.element.style.cursor = 'default';
      if (this.selectedComp.length) {
        this.offset = {};
        this.selectedComp.forEach(component => {
          component.position.x = Math.round(component.position.x / 5) * 5;
          component.position.y = Math.round(component.position.y / 5) * 5;
          const element = this.getElementById(component.id);
          element.style.transform =
            `translate(${component.position.x}px, ${component.position.y}px) ${component.type === 'condition' ? 'rotate(45deg)' : ''}`;
        });
        this.selector = null;
      } else {
        this.endCompMove(e);
      }
      this.addNewChanges(this.flows);
    } else if (this.element.id.indexOf('node') === 0) {
      this.endLineDraw(e);
      this.addNewChanges(this.flows);
    }
  }

  clearComponent() {
    this.element = null;
    this.component = null;
  }

  initWorkspaceMove(e) {
    const rect = this.workspace.getBoundingClientRect();
    const offsetCalc = {
      x: e.offsetX,
      y: e.offsetY
    }
    if (e.target.parentElement.id.indexOf('workspace') != 0) {
      offsetCalc.x = e.x - rect.x;
      offsetCalc.y = e.y - rect.y;
    }
    this.offset.x = offsetCalc.x * this.current.zoom;
    this.offset.y = offsetCalc.y * this.current.zoom;
    this.element.style.transition = 'none';
    this.element.style.transitionTimingFunction = 'unset';
  }

  moveWorkspace(e) {
    if (Object.keys(this.offset).length) {
      this.current.x = e.layerX - this.offset.x;
      this.current.y = e.layerY - this.offset.y;
      this.element.style.transform =
        `translate(${this.current.x}px, ${this.current.y}px) scale(${this.current.zoom})`;
    }
  }

  endWorkspaceMove(e) {
    this.offset = {};
    this.element.style.transition = 'transform 0.3s';
    this.element.style.transitionTimingFunction = 'ease-in-out';
    this.clearComponent();
  }

  initCompMove(e) {
    this.crossed = false;
    this.offset.x = (this.current.x + e.offsetX * this.current.zoom);
    this.offset.y = (this.current.y + e.offsetY * this.current.zoom);
    this.selector = {
      x: e.layerX,
      y: e.layerY
    }
  }

  moveComp(e, isMultipleSelected) {
    if (Object.keys(this.offset).length) {
      const validate = {
        x: (e.layerX - this.offset.x) / this.current.zoom,
        y: (e.layerY - this.offset.y) / this.current.zoom
      };
      if (validate.x < 0 || validate.y < 0) {
        return;
      }
      let compOffset;
      if (isMultipleSelected) {
        compOffset = {
          x: e.layerX - this.selector.x,
          y: e.layerY - this.selector.y
        }
        this.component.position = {
          x: this.component.position.x + compOffset.x,
          y: this.component.position.y + compOffset.y
        };
      } else {
        compOffset = {
          x: validate.x - this.component.position.x,
          y: validate.y - this.component.position.y
        }
        this.component.position = {
          ...validate
        };
      }
      if (this.component.out.length) {
        this.component.out.forEach(line => {
          this.flows.forEach(component => {
            if (component.id === line.destination) {
              component.in.forEach(comp => {
                if (comp.source === this.component.id) {
                  this.offsetLines(line, this.component, component, comp, compOffset, 'source');
                }
              });
            }
          });
        });
      }
      if (this.component.in.length) {
        this.component.in.forEach(comp => {
          this.flows.forEach(component => {
            if (component.id === comp.source) {
              component.out.forEach(line => {
                if (line.destination === this.component.id) {
                  this.offsetLines(line, component, this.component, comp, compOffset, 'destination');
                }
              });
            }
          });
        });
      };
      this.element.style.transform =
        `translate(${this.component.position.x}px, ${this.component.position.y}px) ${this.component.type === 'condition' ? 'rotate(45deg)' : ''}`;
    }
  }

  offsetLines(line, sourceComp, destinationComp, comp, compOffset, compSide) {
    const initialQuadrant = this.getDestinationQuadrant(line.initialPoints[0], line.initialPoints[line.initialPoints.length - 1]);
    const currentQuadrant = this.getDestinationQuadrant(line.position, line.points[line.points.length - 1]);
    this.moveLines(line, compOffset, compSide, comp);
    if (initialQuadrant !== currentQuadrant || this.crossed) {
      this.crossed = true;
      this.setLinePoints(line, line.direction, comp.direction);
      this.validateDirections(line, sourceComp, destinationComp, comp, initialQuadrant, currentQuadrant);
    }
  }

  validateDirections(line, sourceComp, destinationComp, comp, initialQuadrant, currentQuadrant) {
    const sourceDirection = line.direction;
    const destDirection = comp.direction;
    const compCenter = this.getCompCenterFromNodePosition(line.points[line.points.length - 1], destinationComp, destDirection);
    const {
      source: newSourceDirection,
      destination: newDestDirection
    } = this.getNewDirections(line, compCenter, sourceDirection, initialQuadrant, currentQuadrant);

    // Change Source Direction
    if (newSourceDirection && sourceDirection !== newSourceDirection) {
      line.position = this.getNodeOffset(component.position, component.type, newDirection);
      line.direction = newDirection;
      this.changeNodeDirection(sourceComp, sourceDirection, newSourceDirection);
    }

    // Change Destination Direction
    if (newDestDirection && newDestDirection !== destDirection) {
      line.points[line.points.length - 1] =
        this.getNodeOffset(destinationComp.position, destinationComp.type, newDestDirection);
      comp.direction = newDestDirection;
      this.changeNodeDirection(destinationComp, destDirection, newDestDirection);
    }
  };

  // Method to remove old Node and add new permanent node to the component.
  changeNodeDirection(component, oldDirection, newDirection) {
    // const element = this.getElementById(component.id);
    const node = this.getElementById(`node-${component.id}-${oldDirection}`);
    if (node) {
      node.remove();
    }
    // const temp = this.tempComp;
    // this.tempComp = component;
    // element.appendChild(this.addNode(newDirection, true));
    // this.tempComp = temp;
  }

  // Method to validate component position and obtain new directions if change is required.
  getNewDirections(line, compCenter, sourceDirection, initialQuadrant, currentQuadrant) {
    let source, destination;
    const destinationQuadrant = this.getDestinationQuadrant(line.position, compCenter);
    const initialDestinationDirection = this.getLineDirection(line.initialPoints[line.initialPoints.length - 1], line.initialPoints[line.initialPoints.length - 2]);
    if (this.getNeighbouringQuadrants(sourceDirection).indexOf(destinationQuadrant) !== -1) {
      if (sourceDirection !== destinationQuadrant) {
        if (line.points.length === 2 && initialQuadrant !== currentQuadrant) {
          destination = initialDestinationDirection;
        } else {
          destination = this.getOppositeDirection(initialDestinationDirection);
        }
      } else {
        destination = this.getOppositeDirection(sourceDirection);
      }
    } else {
      destination = sourceDirection;
    }
    return {
      source,
      destination
    }
  }

  // Method to move lines. Checks which lines to increace/decrease on mouseMove.
  moveLines(line, offset, compSide, comp) {
    this.lineElement = this.getElementById(line.id);
    if (line.points.length === 1 && this.areParallelDirections(line.direction, comp.direction) && !this.crossed) {
      let midpoint = {};
      if (this.isVertical(line.direction)) {
        midpoint.y = (line.position.y + line.points[line.points.length - 1].y) / 2;
      } else {
        midpoint.x = (line.position.x + line.points[line.points.length - 1].x) / 2;
      }
      this.breakLines(line, midpoint, 3);
    }
    let {
      minIndex,
      maxIndex
    } = this.getLongestAndShortestIndex([line.position, ...line.points], line.direction);
    let index;
    if (line.direction === comp.direction) {
      index = 2;
    } else {
      index = (line.direction === 'bottom' && offset.y > 0) || (line.direction === 'top' && offset.y < 0) ||
        (line.direction === 'right' && offset.x > 0) || (line.direction === 'left' && offset.x < 0) ?
        minIndex : maxIndex;
    }
    this.handleLineDisplacement(line, compSide, offset, index);
    this.drawLine(line);
  }

  // Method to set the points ignoring user Configurations.
  setLinePoints(line, sourceDirection, destinationDirection) {
    const isSameDirection = sourceDirection === destinationDirection;
    let point;
    let midpoint = {};
    if ((line.points.length === 3) &&
      ((this.isVertical(line.direction) && Math.abs(line.position.x - line.points[line.points.length - 1].x) <= 1) ||
        (this.isHorizontal(line.direction) && Math.abs(line.position.y - line.points[line.points.length - 1].y) <= 1))) {
      line.points.splice(0, line.points.length - 1);
    } else if (this.areParallelDirections(sourceDirection, destinationDirection)) {
      if (this.isVertical(line.direction)) {
        if (line.direction === 'top') {
          point = Math.min(line.position.y, line.points[line.points.length - 1].y) - 100;
        } else {
          point = Math.max(line.position.y, line.points[line.points.length - 1].y) + 100;
        }
        midpoint.y = isSameDirection ? point : (line.position.y + line.points[line.points.length - 1].y) / 2;
      } else {
        if (line.direction === 'left') {
          point = Math.min(line.position.x, line.points[line.points.length - 1].x) - 100;
        } else {
          point = Math.max(line.position.x, line.points[line.points.length - 1].x) + 100;
        }
        midpoint.x = isSameDirection ? point : (line.position.x + line.points[line.points.length - 1].x) / 2;
      }
      this.breakLines(line, midpoint, 3);
    } else {
      midpoint = {
        x: this.isHorizontal(line.direction) && line.points[line.points.length - 1].x,
        y: this.isVertical(line.direction) && line.points[line.points.length - 1].y
      };
      this.breakLines(line, midpoint, 2);
    }
  }

  handleLineDisplacement(line, compSide, offset, index) {
    for (let i = 0; i < line.points.length; i++) {
      if (compSide === 'destination') {
        if (i === 0 && index === 0) {
          this.isVertical(line.direction) ? line.points[i].y += offset.y : line.points[i].x += offset.x;
        } else if (i === 0 && index !== 0) {
          continue;
        } else if (i === 1 && index !== 0) {
          this.isVertical(line.direction) ? line.points[i].x += offset.x : line.points[i].y += offset.y;
        } else {
          line.points[i].x += offset.x;
          line.points[i].y += offset.y;
        }
      } else {
        if ((i === 0 && (index !== 0 || line.points.length === 2))) {
          this.isVertical(line.direction) ? line.points[i].x += offset.x : line.points[i].y += offset.y;
        } else if (i === line.points.length - 1 || (i === line.points.length - 2 && index !== 0)) {
          continue;
        } else if (i === (line.points.length - 2) && index === 0) {
          this.isVertical(line.direction) ? line.points[i].y += offset.y : line.points[i].x += offset.x;
        } else {
          line.points[i].x += offset.x;
          line.points[i].y += offset.y;
        }
      }
    }
    if (compSide === 'source') {
      line.position.x += offset.x;
      line.position.y += offset.y;
    }
  }

  breakLines(line, midpoint, numberOfLines) {
    if (numberOfLines === 3) {
      line.points = [{
        x: midpoint.x || line.position.x,
        y: midpoint.y || line.position.y
      }, {
        x: midpoint.x || line.points[line.points.length - 1].x,
        y: midpoint.y || line.points[line.points.length - 1].y
      }, {
        x: line.points[line.points.length - 1].x,
        y: line.points[line.points.length - 1].y
      }];
    } else if (numberOfLines === 2) {
      line.points = [{
        x: midpoint.x || line.position.x,
        y: midpoint.y || line.position.y
      }, {
        x: line.points[line.points.length - 1].x,
        y: line.points[line.points.length - 1].y
      }];
    }
  }

  getCompCenterFromNodePosition(position, destinationComp, direction) {
    const {
      width,
      height
    } = this.getCompDimensions(destinationComp.type);
    const newPosition = {
      ...position
    };
    if (direction === 'top') {
      newPosition.y += height / 2;
    } else if (direction === 'bottom') {
      newPosition.y -= height / 2;
    } else if (direction === 'left') {
      newPosition.x += width / 2;
    } else if (direction === 'right') {
      newPosition.x -= width / 2;
    }
    return newPosition;
  }

  getNeighbouringQuadrants(sourceDirection) {
    const directions = [1, 'top', 2, 'left', 3, 'bottom', 4, 'right', 1];
    const index = directions.indexOf(sourceDirection);
    if (index === -1) {
      return null;
    } else if (index === 0) {
      return [directions[0], directions[directions.length - 2], 1];
    } else {
      return [directions[index - 1], directions[index], directions[index + 1]];
    }
  }

  getDestinationQuadrant(start, end) {
    const offset = 100;
    let quadrant;
    if (end.x > start.x + offset) {
      if (end.y > start.y + offset) {
        quadrant = 4;
      } else if (end.y < start.y - offset) {
        quadrant = 1;
      } else if ((end.y <= start.y + offset) && (end.y >= start.y - offset)) {
        quadrant = 'right';
      }
    } else if (end.x < start.x - offset) {
      if (end.y > start.y + offset) {
        quadrant = 3;
      } else if (end.y < start.y - offset) {
        quadrant = 2;
      } else if ((end.y <= start.y + offset) && (end.y >= start.y - offset)) {
        quadrant = 'left';
      }
    } else if ((end.x <= start.x + offset) && (end.x >= start.x - offset)) {
      if (end.y < start.y - offset) {
        quadrant = 'top';
      } else if (end.y > start.y + offset) {
        quadrant = 'bottom';
      } else {
        quadrant = 0;
      }
    }
    return quadrant;
  }

  getNodeOffset(position, type, direction) {
    const {
      width,
      height
    } = this.getCompDimensions(type);
    if (direction === 'top') {
      return {
        x: position.x + width / 2,
        y: position.y
      };
    } else if (direction === 'right') {
      return {
        x: position.x + width,
        y: position.y + height / 2
      };
    } else if (direction === 'left') {
      return {
        x: position.x,
        y: position.y + height / 2
      };
    } else if (direction === 'bottom') {
      return {
        x: position.x + width / 2,
        y: position.y + height
      };
    } else {
      return null;
    }
  }

  getCompDimensions(type) {
    let width = 0;
    let height = 0;
    if (type === 'event') {
      width = 100;
      height = 100;
    } else if (type === 'action') {
      width = 100;
      height = 50;
    } else if (type === 'condition') {
      width = 141.5;
      height = 141.5;
    } else {
      return null;
    }
    return {
      width,
      height
    }
  }

  // Utility method to check which point index to increace/decrease on mouseMove.
  getLongestAndShortestIndex(points, direction) {
    let max = 0;
    let min = Infinity;
    let maxIndex, minIndex;
    for (let i = 1; i < points.length; i++) {
      if (i % 2) {
        const distance = this.isVertical(direction) ? Math.abs(points[i].y - points[i - 1].y) :
          Math.abs(points[i].x - points[i - 1].x);
        if (distance > max) {
          max = distance;
          maxIndex = i - 1;
        };
        if (distance < min) {
          min = distance;
          minIndex = i - 1;
        };
      } else {
        continue;
      }
    }
    return {
      minIndex,
      maxIndex
    };
  }

  getOppositeDirection(direction) {
    if (direction === 'top') {
      return 'bottom';
    } else if (direction === 'bottom') {
      return 'top';
    } else if (direction === 'left') {
      return 'right';
    } else if (direction === 'right') {
      return 'left';
    } else {
      return null;
    }
  }

  getLineDirection(start, end) {
    if (start.x === end.x) {
      if (start.y < end.y) {
        return 'top';
      } else {
        return 'bottom';
      }
    } else if (start.y === end.y) {
      if (start.x < end.x) {
        return 'left';
      } else {
        return 'right';
      }
    } else {
      return null;
    }
  }

  isVertical(direction) {
    return direction === 'top' || direction === 'bottom';
  }

  isHorizontal(direction) {
    return direction === 'left' || direction === 'right';
  }

  areParallelDirections(firstDirection, secondDirection) {
    return this.isVertical(firstDirection) && this.isVertical(secondDirection) ||
      (this.isHorizontal(firstDirection) && this.isHorizontal(secondDirection))
  }

  endCompMove(e) {
    this.offset = {};
    this.component.position.x = Math.round(this.component.position.x / 5) * 5;
    this.component.position.y = Math.round(this.component.position.y / 5) * 5;
    this.element.style.transform =
      `translate(${this.component.position.x}px, ${this.component.position.y}px) ${this.component.type === 'condition' ? 'rotate(45deg)' : ''}`;
    this.clearComponent();

  }

  initLineDraw(e) {
    const rect = this.workspace.getBoundingClientRect();
    const correction = {
      x: (e.offsetX * 1.5) * this.current.zoom,
      y: (e.offsetY * 1.5) * this.current.zoom
    }
    const highlightOffset = 15 - 15 / 1.5;
    this.offset.x = e.x - correction.x;
    this.offset.y = e.y - correction.y;
    this.line = {
      id: 'line' + this.component.id + '-' + this.component.out.length,
      direction: this.element.dataset.direction,
      destination: '',
      position: {
        x: ((e.x - correction.x - rect.x) / this.current.zoom) + highlightOffset,
        y: ((e.y - correction.y - rect.y) / this.current.zoom) + highlightOffset
      },
      points: [{
        x: 0,
        y: 0
      }],
      completed: false
    }
    this.prevPoint = {
      ...this.line.position,
      modified: this.line.direction === 'top' || this.line.direction === 'bottom' ? 'vertical' : 'horizontal'
    };
    this.createLineGroup(this.line, e);
  }

  createLineGroup(line, e) {
    this.lineElement = this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'g'
    }, {
      id: line.id,
      class: 'line-' + this.component.id,
      ['data-direction']: line.direction,
      style: 'position: absolute; z-index: -2; cursor: crosshair;',
    }, [
      this.ce({
        namespace: 'http://www.w3.org/2000/svg',
        tag: 'path'
      }, {
        id: 'path',
        class: 'path-1',
        nativeStyle: {
          strokeWidth: 1,
          opacity: 1,
          fill: 'none'
        }
      }),
      this.ce({
        namespace: 'http://www.w3.org/2000/svg',
        tag: 'path'
      }, {
        id: 'arrow',
        nativeStyle: {
          strokeWidth: 1,
          opacity: 1,
          stroke: 'black'
        },
      })
    ]);
    this.drawLine(line, e);
  }

  trackLinePoints(e) {
    if (Object.keys(this.offset).length) {
      let displaceX = (e.x - this.offset.x) / this.current.zoom;
      let displaceY = (e.y - this.offset.y) / this.current.zoom;
      if (this.prevPoint.x && this.prevPoint.y) {
        displaceX -= this.prevPoint.x - this.line.position.x;
        displaceY -= this.prevPoint.y - this.line.position.y;
      }
      const currPointIndex = this.line.points.length - 1;
      let modified = false;
      const maxLineBreaks = 2;
      if ((Math.abs(displaceY) > 30)) {
        if (this.prevPoint.modified === 'horizontal' && currPointIndex < maxLineBreaks) {
          this.prevPoint = {
            ...this.line.points[currPointIndex],
            modified: 'vertical'
          }
          modified = true;
          this.line.points.push({
            x: this.prevPoint.x,
            y: this.prevPoint.y + displaceY
          });
        } else if (this.prevPoint.modified !== 'horizontal') {
          this.line.points[currPointIndex].x = this.prevPoint.x;
          this.line.points[currPointIndex].y = this.prevPoint.y + displaceY;
        }
      } else if ((Math.abs(displaceY) < 30) && currPointIndex > 0 &&
        this.prevPoint.modified === 'vertical') {
        this.line.points.pop();
        this.prevPoint = currPointIndex > 1 ? this.line.points[currPointIndex - 1] : this.line.position;
        this.prevPoint.modified = 'horizontal';
        return;
      }
      if (((Math.abs(displaceX) > 30)) && !modified) {
        if (this.prevPoint.modified === 'vertical' && currPointIndex < maxLineBreaks) {
          this.prevPoint = {
            ...this.line.points[currPointIndex],
            modified: 'horizontal'
          }
          this.line.points.push({
            x: this.prevPoint.x + displaceX,
            y: this.prevPoint.y
          });
        } else if (this.prevPoint.modified !== 'vertical') {
          this.line.points[currPointIndex].x = this.prevPoint.x + displaceX;
          this.line.points[currPointIndex].y = this.prevPoint.y;
        }
      } else if ((Math.abs(displaceX) < 30) && !modified && currPointIndex > 0 &&
        this.prevPoint.modified === 'horizontal') {
        this.line.points.pop();
        this.prevPoint = currPointIndex > 1 ? this.line.points[currPointIndex - 1] : this.line.position;
        this.prevPoint.modified = 'vertical';
        return;
      }
    }
    this.drawLine(this.line, e);
  }

  drawLine(line, e) {
    const linePath = this.getLinePath(line);
    const arrowPath = this.getArrowPath(line);
    if (this.component.type === 'condition') {
      const textElem = this.lineElement.querySelector('#condition');
      if (!textElem) {
        this.lineElement.appendChild(this.addConditionLabel(line, false));
      }
    }
    linePath.forEach((line, index) => {
      if (!this.lineElement.querySelector(`.path-${index+1}`)) {
        this.ac(this.lineElement, this.ce({
          namespace: 'http://www.w3.org/2000/svg',
          tag: 'path'
        }, {
          id: 'path',
          class: `path-${index+1}`,
          nativeStyle: {
            strokeWidth: 1,
            opacity: 1,
            fill: 'none'
          }
        }));
      }
      this.ce(this.lineElement.querySelector(`.path-${index+1}`), {
        stroke: 'black',
        ['stroke-dasharray']: e ? '5.5' : '',
        d: line,
      });
    });
    this.lineElement.querySelectorAll('#path').forEach(path => {
      if (Number(path.classList[0].split('path-')[1]) > linePath.length) {
        path.remove();
      }
    });
    this.ce(this.lineElement.querySelector('#arrow'), {
      d: arrowPath,
    });
    this.ac(this.svg, this.lineElement);
    if (!e) {
      this.lineElement = null;
      this.line = null;
    }
  }

  getLinePath(line) {
    let lines = [];
    const {
      x,
      y
    } = line.points[0];
    if (x === 0 && y === 0) {
      return lines;
    }
    let nx = line.position.x;
    let ny = line.position.y;
    let offsetX = 0;
    let offsetY = 0;
    if (this.isVertical(line.direction)) {
      offsetX = 6;
    } else {
      offsetY = 6;
    }
    let linePath = `M ${nx + offsetX} ${ny + offsetY}`;
    line.points.forEach(point => {
      lines.push(`${linePath} L ${point.x + offsetX} ${point.y + offsetY}`);
      linePath = `M ${point.x + offsetX} ${point.y + offsetY}`;
    });
    return lines;
  }


  getArrowPath(line) {
    let arrowPath = ``;
    const {
      x,
      y
    } = line.points[0];
    if (x === 0 && y === 0) {
      return arrowPath;
    }
    let nx = line.position.x;
    let ny = line.position.y;
    switch (line.direction) {
      case 'top':
        arrowPath = (`M ${2.5 + nx} ${(y/2) + ny/2} L ${nx + 6.25} ${(y/2) + ny/2 - 7.5} 
                      L ${nx + 10} ${y/2 + ny/2} z`);
        break;
      case 'right':
        arrowPath = (`M ${(x/2) + nx/2} ${2.5 + ny} L ${(x/2) + nx/2 + 7.5 } ${6.25 + ny}
                      L ${(x/2) + nx/2} ${ny + 10} z`);
        break;
      case 'bottom':
        arrowPath = (`M ${2.5 + nx} ${(y/2) + ny/2} L ${6.25 + nx} ${(y/2) + ny/2 + 7.5} 
                      L ${10 + nx} ${(y/2) + ny/2} z`);
        break;
      case 'left':
        arrowPath = (`M ${(x/2) + nx/2} ${2.5 + ny} L ${(x/2) + nx/2 - 7.5} ${6.25 + ny}
                      L ${(x/2) + nx/2} ${10 + ny} z`);
        break;
      default:
        break;
    }
    return arrowPath;
  }

  endLineDraw(e) {
    this.offset = {};
    const destination = this.highlighted && this.highlighted.dataset;
    if (destination && destination.comp !== this.component.id) {
      this.line.points.forEach((point, index) => {
        this.ce(this.lineElement.querySelector(`.path-${index+1}`), {
          ['stroke-dasharray']: ''
        });
      });
      this.lineElement.style.cursor = 'default';
      // e.target.parentElement.classList.remove('temp');
      this.line.destination = destination.comp;
      this.line.initialPoints = JSON.parse(JSON.stringify([this.line.position, ...this.line.points]));
      this.component.out.push(this.line);
      this.getComponentById(this.flows, destination.comp).in.push({
        direction: destination.direction,
        source: this.component.id
      });
    } else {
      this.lineElement.remove();
      if (this.workspace.getElementsByClassName(`line-${this.component.id}`).length < 1) {
        this.element.remove();
        this.element = null;
      }
    }
    this.clearComponent();
    this.lineElement = null;
    this.line = null;
    // TODO: remove after fetch
  }

  getComponentById(comps, id) {
    return comps.find(comp => {
      return comp.id === id;
    });
  }

  undo() {
    if (this.undoIndex > 1) {
      this.undoIndex--;
      this.flows = JSON.parse(this.changes[this.undoIndex - 1]);
      this.svg.innerHTML = '';
      this.renderComponents(this.flows);
    }
  }

  redo() {
    if (this.undoIndex < this.changes.length) {
      this.undoIndex++;
      this.flows = JSON.parse(this.changes[this.undoIndex - 1]);
      this.svg.innerHTML = '';
      this.renderComponents(this.flows);
    }
  }

  addNewChanges() {
    this.changes.splice(this.undoIndex, this.changes.length - (this.undoIndex));
    this.changes.push(JSON.stringify(this.flows));
    this.undoIndex++;
  }

  toggleSelectMode() {
    this.selectMode = this.selectMode === 'Move' ? 'Select' : 'Move';
    this.getElementById('multiSelect').classList.toggle('focus');
  }

  setElemByEvent(e) {
    const rootElem = e.target.parentElement;
    if (rootElem.id.indexOf('comp') === 0) {
      this.element = rootElem;
    } else if (rootElem.id.indexOf('node') === 0) {
      this.element = rootElem;
    } else if (rootElem.id.indexOf('line') === 0) {
      this.element = rootElem;
    } else if (e.target.id.indexOf('label') === 0) {
      this.element = e.target.parentElement.parentElement;
    } else if (rootElem.id.indexOf('workspace') === 0) {
      this.element = this.workspace;
    } else if (rootElem.id.indexOf('curve') === 0) {
      this.element = rootElem;
    } else {
      return;
    }
  }

  create() {
    this.svg = this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'svg'
    }, {
      id: 'svg',
      class: 'svg',
      style: 'position: absolute; z-index: -2;',
      width: '100%',
      height: '100%'
    });
    this.workspace = this.ce('div', {
      id: 'workspace',
      on: {
        contextmenu: this.openMenuOptions.bind(this),
        click: this.closeMenuOptions.bind(this),
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this),
        drop: this.drop.bind(this),
        dragover: this.allowDrop.bind(this),
      }
    });
    this.renderComponents(this.flows);
    this.addNewChanges(this.flows);
    return [this.workspace, new Tools({
      zoom: this.zoom.bind(this),
      reset: this.reset.bind(this),
      undo: this.undo.bind(this),
      redo: this.redo.bind(this),
      toggleSelectMode: this.toggleSelectMode.bind(this),
    }).create()];
  }

  renderComponents(flows) {
    this.workspace.innerHTML = '';
    this.ac(this.workspace, [this.svg, flows.map((component) => this.placeComponent(component))]);
  }

  // Provide options for deleting and editing the components
  openMenuOptions(e) {
    e.preventDefault();
    this.closeMenuOptions();
    this.setElemByEvent(e);
    if (this.element.id.indexOf('comp') === 0) {
      this.component = this.getComponentById(this.flows, this.element.id);
    } else if (this.element.id.indexOf('linecomp') === 0) {
      // this.component = this.getComponentById(this.flows, this.element.dataset.comp);
      this.component = this.getComponentById(this.flows, this.element.dataset.comp).out[0];
    } else {
      this.clearComponent();
      return;
    }
    let menuItems = [];
    const deleteMenu = () => (this.ce('li', {
      on: {
        click: this.deleteMenu.bind(this)
      },
      keys: {
        innerHTML: "Delete"
      }
    }));
    const editMenu = () => (this.ce('li', {
      on: {
        click: this.editMenu.bind(this)
      },
      keys: {
        innerHTML: "Edit"
      }
    }));
    menuItems.push(deleteMenu());
    this.component.id.indexOf('line') === -1 && menuItems.push(editMenu());
    this.menuOptions = this.ce('div', {
      id: 'menuOptions',
      style: `transform: translate(${e.x}px, ${e.y}px)`
    }, this.ce('ul', {
      id: 'items'
    }, menuItems));
    this.workspace.appendChild(this.menuOptions);
  }

  // Delete the component
  deleteMenu(e) {
    this.closeMenuOptions();
    if (this.component.id.indexOf('line') === 0) {
      const line = this.getElementById(this.component.id)
      line.remove();
      const source = this.getComponentById(this.flows,
        this.component.id.substring(4, this.component.id.length - 2));
      source.out.map((line, index) => {
        if (line.id === this.component.id) {
          source.out.splice(index, 1);
        }
      });
      const destination = this.getComponentById(this.flows, this.component.destination);
      destination.in.map((comp, index) => {
        if (comp.source === source.id) {
          destination.in.splice(index, 1);
        }
      });
      // If comp is used instead of line
      // this.getElementById(this.component.id).remove();
      // const source = this.getComponentById(this.flows, this.component.id).out;
      // source.splice(source.indexOf(this.line), 1);
      // const destination = this.getComponentById(this.flows, this.line.destination).in;
      // destination.find((dest, index) => {
      //   if (dest.source === source.id) {
      //     destination.splice(index, 1);
      //   }
      // });
    } else {
      this.flows.splice(this.flows.indexOf(this.component), 1);
      this.clearComponent();
      if (this.storage.instance) {
        this.modal.remove();
        this.storage.instance = null;
      }
    }
    this.renderComponents(this.flows);

  }

  // Open the component Modal
  editMenu(e) {
    this.closeMenuOptions();
    this.openModal();
  }

  // Close the menu options while clicking other than components.
  closeMenuOptions(e) {
    this.menuOptions && this.menuOptions.remove(), this.menuOptions = null;
  }
}