import React from 'react'
import { Modal, Button, Container, Row, Col } from 'react-bootstrap'

import { SaveButton, OptionList, Description, FeatureList } from './common'


class OriginEditor extends React.Component {
  constructor(props) {
    super(props);
    this.originData = props.data;
    this.featureData = props.featureData;
    this.state = {
      selectedOrigin: null,
      selectedSuborigin: null,
      selectedOriginFeatures: null,
      selectedSuboriginFeatures: null
    }
  }

  selectOrigin(origin) {
    if (origin === this.state.selectedOrigin) {
      return;
    }
    var features = []
    if (origin !== null && origin in this.originData) {
      features = this.originData[origin]["features"]
    }

    this.setState(state => {
      state.selectedOrigin = origin;
      state.selectedSuborigin = null;
      state.selectedOriginFeatures = features
      state.selectedSuboriginFeatures = [];
      return state
    });
  }

  selectSuborigin(suborigin) {
    if (suborigin === this.state.selectedSuborigin) {
      return;
    } 
    const selectedOrigin = this.originData[this.state.selectedOrigin]
    var features = []
    if (suborigin !== null && suborigin in selectedOrigin["suborigins"]) {
      features = selectedOrigin["suborigins"][suborigin]["features"]
    }

    this.setState(state => {
      state.selectedSuborigin = suborigin
      state.selectedSuboriginFeatures = features
      return state
    });
  }

  // Assumes all origin features have unique names (THEY SHOULD)
  updateOriginFeature(feature) {
    this.setState(state => {
      state.selectedOriginFeatures.map(originFeature => {
        if (feature.name === originFeature.name) {
          return feature;
        } else {
          return originFeature;
        }
      });
      return state;
    })
  }

  // Assumes all suborigin features have unique names (THEY SHOULD)
  updateSuboriginFeature(feature) {
    this.setState(state => {
      state.selectedOriginFeatures.map(originFeature => {
        if (feature.name === originFeature.name) {
          return feature;
        } else {
          return originFeature;
        }
      });
      return state;
    })
  }

  renderSelected() {
    const selectedOrigin = this.state.selectedOrigin;
    const selectedSuborigin = this.state.selectedSuborigin;
    if (selectedOrigin === null || !(selectedOrigin in this.originData)) {
      return
    }
    const originData = this.originData[selectedOrigin]
    var suboriginData = {name: null, description: null}
    if (selectedSuborigin !== null && selectedSuborigin in originData["suborigins"]) {
      suboriginData = originData["suborigins"][selectedSuborigin]
    }

    return (
      <div>
        <Row>
          <Col lg={6}>
            <Description name={originData.name} description={originData.description} />
          </Col>
          <Col lg={2} />
          <Col lg={4}>
            <Row>
              <OptionList
                options={originData.suborigins}
                selected={this.state.selectedSuborigin} 
                onClick={suborigin => this.selectSuborigin(suborigin)}
              />
            </Row>
            <Row>
              <Description name={suboriginData.name} description={suboriginData.description} />
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={6} >
            <FeatureList features={this.state.selectedOriginFeatures} data={this.featureData} onUpdate={feature => this.updateOriginFeature(feature)} />
          </Col>
          <Col md={6} >
            <FeatureList features={this.state.selectedSuboriginFeatures} data={this.featureData} onUpdate={feature => this.updateSuboriginFeature(feature)} />
          </Col>
        </Row>
      </div>
    )

  }

  render() {
    const origins = this.originData
    const selectedOrigin = this.renderSelected()
    return (
      <Container>
        <Row>
          <Col lg={2}>
            <OptionList
              options={this.originData}
              selected={this.state.selectedOrigin}
              onClick={origin => this.selectOrigin(origin)}
            />
          </Col>
          <Col lg={10}>
            {selectedOrigin}
          </Col>
        </Row>
      </Container>
    )
  }
}

class OriginStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectOrigin: props.origin,
      saveable: false
    };
  }

  updateSaveable(value) {
    this.setState(state => (state.saveable = value, state));
  }

  render() {
    return (
      <Modal className="creatorStep" size="lg" show={this.props.show} onHide={this.props.handleClose} scrollable={true}>
        <Modal.Header>
          <Modal.Title>Select Origin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <OriginEditor 
            data={this.props.data}
            featureData={this.props.featureData}
            current={this.props.current}
            onComplete={this.updateSavable} />
          </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleClose}>Close</Button>
          <SaveButton value="Save Origin" enabled={this.state.saveable} onClick={this.props.handleSave} />
        </Modal.Footer>
      </Modal>
    )
  }
}

export default OriginStep