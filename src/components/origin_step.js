import React from 'react'
import { Modal, Button, Container, Row, Col } from 'react-bootstrap'

import { SaveButton, OptionList, Description, FeatureCard, initializeFeature } from './common'


class OriginEditor extends React.Component {
  constructor(props) {
    super(props);
    this.originData = props.data;
    this.featureData = props.featureData;

    var origin = null;
    var suborigin = null;
    if (props.current.origin) {
      origin = props.current.origin.origin
      suborigin = props.current.origin.suborigin
      this.availableSuborigins = this.originData[origin].suborigins
      this.selectedOriginFeatures = props.current.features.filter(f => f.source === 'origin')
      this.selectedSuboriginFeatures = props.current.features.filter(f => f.source === 'suborigin')
    } else {
      this.availableSuborigins = {};
      this.selectedOriginFeatures = [];
      this.selectedSuboriginFeatures = [];
    }
    this.state = {
      selectedOrigin: origin,
      selectedSuborigin: suborigin
    }
  }

  selectOrigin(origin) {
    var features = [];
    if (origin !== null && this.originData.hasOwnProperty(origin)) {
      features = this.originData[origin].features.map(f => initializeFeature(f, 'origin_' + origin))
    }
    this.selectedOriginFeatures = features;

    if (this.originData[origin].hasOwnProperty('suborigins')) {
      this.availableSuborigins = this.originData[origin].suborigins
    } else {
      this.availableSuborigins = {}
    }

    this.selectedSuboriginFeatures = []
    this.setState({
      selectedOrigin: origin,
      selectSuborigin: null
    }, this.onUpdate);
  }

  selectSuborigin(suborigin) {
    var features = []
    if (suborigin !== null && this.availableSuborigins.hasOwnProperty(suborigin)) {
      features = this.availableSuborigins[suborigin].features.map(f => initializeFeature(f, 'suborigin_' + suborigin))
    }

    this.selectedSuboriginFeatures = features
    this.setState({
      selectedOrigin: this.state.selectedOrigin,
      selectedSuborigin: suborigin
    }, this.onUpdate);
  }

  onUpdate() {
    this.props.onUpdate({
      origin: this.state.selectedOrigin,
      originFeatures: this.selectedOriginFeatures,
      noSuborigins: Object.entries(this.availableSuborigins).length === 0,
      suborigin: this.state.selectedSuborigin,
      suboriginFeatures: this.selectedSuboriginFeatures
    })
  }

  renderSelected() {
    const selectedOrigin = this.state.selectedOrigin;
    const selectedSuborigin = this.state.selectedSuborigin;
    if (selectedOrigin === null || !(selectedOrigin in this.originData)) {
      return <div/>
    }
    const originData = this.originData[selectedOrigin]
    var suboriginData = {name: null, description: null}
    if (selectedSuborigin !== null && selectedSuborigin in this.availableSuborigins) {
      suboriginData = this.availableSuborigins[selectedSuborigin]
    }

    const originFeatures = this.selectedOriginFeatures.map(f => (
        <Row key={f.id}>
          <FeatureCard feature={f} data={this.featureData} onUpdate={() => this.onUpdate()} />
        </Row>)
    )
    const suboriginFeatures = this.selectedSuboriginFeatures.map(f => (
      <Row key={f.id}>
        <FeatureCard feature={f} data={this.featureData} onUpdate={() => this.onUpdate()} />
      </Row>)
    )

    return (
      <div>
        <Row>
          <Col md={7}>
            <Description name={originData.name} description={originData.description} />
          </Col>
          <Col lg={1} />
          <Col lg={4}>
            <Row>
              <OptionList
                options={this.availableSuborigins}
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
            {originFeatures}
          </Col>
          <Col md={6} >
            {suboriginFeatures}
          </Col>
        </Row>
      </div>
    )

  }

  render() {
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

    this.selected = null;
    this.state = {
      saveable: false
    };
  }

  updateOrigin(value) {
    // Check the selected origin and features.
    // - Origin must be selected
    // - All selected origin features must be complete
    // - Suborigin must be selected (if suborigin exists)
    // - All selected suborigin featrues must be complete (if suborigin exists)\
    var stepIsComplete = false
    this.selected = value
    if (this.selected.origin !== null &&
        this.selected.originFeatures.every(f => f.complete) &&
        (this.selected.noSuborigins ||
          (this.selected.suborigin !== null &&
           this.selected.suboriginFeatures.every(f => f.complete)))
        )
    {
      stepIsComplete = true
    }

    this.setState({
      saveable: stepIsComplete
    });
  }

  saveOrigin() {
    const origin = {
      origin: this.selected.origin,
      suborigin: this.selected.suborigin
    }
    const features = this.selected.originFeatures.map(f => {
      f['source'] = 'origin';
      return f;
    })
    if (!this.selected.noSuborigins) {
      this.selected.suboriginFeatures.forEach(f => {
        f['source'] = 'suborigin';
        features.push(f)
      })
    }
    this.props.handleSave({
      origin: origin,
      features: features
    })
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
            onUpdate={value => this.updateOrigin(value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleClose}>Close</Button>
          <SaveButton value="Save Origin" enabled={this.state.saveable} onClick={() => this.saveOrigin()} />
        </Modal.Footer>
      </Modal>
    )
  }
}

export default OriginStep