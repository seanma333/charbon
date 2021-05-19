import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'

import OriginStep from './originstep'

function StepButton(props) {
  const buttonName = props.value.split("_")
                          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                          .join(' ');
  switch(props.status) {
    case 1:
      return (
        <Button key={props.value} className="stepButton" size="lg" onClick={() => props.onClick()}>
          {buttonName}
        </Button>
      );
    case 2:
      return (
        <Button key={props.value} className="stepButton" size="lg" variant="success" onClick={() => props.onClick()}>
          {buttonName}
        </Button>
      );
    default:
      return (
        <Button key={props.value} className="stepButton" size="lg" disabled>
          {buttonName}
        </Button>
      );
  }
}

class CharacterNameEditor extends React.Component {
  render() {
    const displayName = (this.props.name === null) ? 'Character Name' : this.state.name
    console.log(displayName)
    return <div className="characterName">{displayName}</div>
  }
}

function CharacterDisplay(props) {
  const character = props.character;
  console.log(character)
  return (
    <Row></Row>
  )
}

class Creator extends React.Component {
  constructor(props) {
    super(props);

    // Load all data from json files
    this.data = {}
    this.fetchData();

    // Begin with a blank slate. Update this in the future to be able to load a character.
    this.state = {
      steps: [
        {name: 'origin', status: 1},
        {name: 'career', status: 0},
        {name: 'abilities', status: 0},
        {name: 'class', status: 0},
        {name: 'buy_gear', status: 0},
        {name: 'level_up', status: 0},
        {name: 'next_steps', status: 0}
      ],
      editingName: false,
      openStep: null,
      character: {
        name: null,
        age: null,
        features: [],
        origin: null,
        abilities: null,
        career: null,
        speed: null,
        climb_speed: null,
        fly_speed: null,
        swim_speed: null,
        languages: [],
        natural_armor: 10,
        ac: null,
        hp: null,
        senses: [],
        exploits: null,
        attacks: ['unarmed_strike'],
        actions: [],
        bonus_actions: [],
        reactions: [],
        saving_throws: [],
        weapon_proficiencies: ['unarmed_strike'],
        armor_proficiencies: [],
        skill_proficiencies: [],
        skill_half_proficiencies: null,
        skill_expertise: null,
        tool_proficiencies: [],
        tool_half_proficiencies: null,
        tool_expertise: null,
        augmentations: []
      }
    };
  }

  fetchData() {
    // Get ability score data
    fetch('./json/ability_scores.json', {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      .then(response => {
        return response.json()
      })
      .then(data => this.data.abilityScores = data)
    
    // Get language data
    fetch('./json/languages.json', {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      .then(response => {
        return response.json()
      })
      .then(data => this.data.languages = data)

    // Get skills data
    fetch('./json/skills.json', {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      .then(response => {
        return response.json()
      })
      .then(data => this.data.skills = data)

    // Get tools data
    fetch('./json/tools.json', {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      .then(response => {
        return response.json()
      })
      .then(data => this.data.tools = data)
      
    // Get Origin data
    fetch('./json/origins.json', {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      .then(response => {
        return response.json()
      })
      .then(data => this.data.origins = data)
  }

  editName() {
    this.setState(state => (state.editingName = true, state));
  }

  openStep(stepName) {
    this.setState(state => (state.openStep = stepName, state));
  }

  closeStep() {
    this.setState(state => (state.openStep = false, state));
  }

  render() {
    console.log(this.data)
    const renderSteps = this.state.steps.map((step) => {
        return <Row key={step.name}>
          <StepButton
            value={step.name}
            status={step.status}
            onClick={() => this.openStep(step.name)}
          />
        </Row>
      })

    return (
      <div>
        <Container>
          <Row>
            <Col lg={4}>
              {renderSteps}
            </Col>

            <Col lg={8}>
              <Row><CharacterNameEditor name={this.state.character.name} editing={this.state.editingName} /></Row>
              <Row>{/* Display the character*/}</Row>
            </Col>
          </Row>

          <OriginStep
            show={this.state.openStep === "origin"}
            current={this.state.character.origin}
            data={this.data.origins}
            featureData={
              {
                abilityScores: this.data.abilityScores,
                tools: this.data.tools,
                skills: this.data.skills,
                languages: this.data.languages
              } 
            }
            handleClose={() => this.closeStep()}
            handleSave={() => this.closeStep()}
          />
        </Container>
      </div>
    )
  }
}

export default Creator;