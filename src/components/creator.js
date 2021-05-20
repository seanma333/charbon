import React from 'react'
import { Container, Row, Col, Button, Form } from 'react-bootstrap'

import { SaveButton } from './common'
import OriginStep from './origin_step'

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

class CharacterNameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onSave = props.onSave
    this.placeholderText = "Enter Character Name"
    this.name = this.props.name ? this.props.name : ""
    this.state = {
      edit: props.editingName,
      saveable: (this.name) ? true : false
    }
  }

  toggleEdit() {
    this.setState({
      edit: !this.state.edit,
      saveable: this.state.saveable
    })
  }

  handleChange(event) {
    this.name = event.target.value
    this.setState({
      edit: this.state.edit,
      saveable: this.name ? true: false
    })
  }

  saveName() {
    this.onSave(this.name)
    this.setState({
      edit: false,
      saveable: this.name ? true: false
    })
  }

  render() {
    if (this.state.edit) {
      return (
        <Form className="characterName">
          <Row>
            <Col md={9}><Form.Control placeholder={this.placeholderText} onChange={e => this.handleChange(e)} value={this.name} /></Col>
            <Col md={3}><SaveButton value="Save Name" onClick={() => this.saveName()} enabled={this.state.saveable} size="lg"/></Col>
          </Row>
        </Form>
      )
    } else {
      var displayValue = (this.name) ? this.name : this.placeholderText;
      return (
        <Form className="characterName">
          <Form.Control plaintext readOnly defaultValue={displayValue} size="lg" onClick={() => this.toggleEdit()} />
        </Form>
      )
    }
  }
}

// Used for displaying the character as currently built
function CharacterDisplay(props) {
  const displayCharacter = JSON.stringify(props.character, null, 4)
  return (
    <div style={{"height": "600px"}}>
      <pre style={{"max-height": "100%"}}>
        {displayCharacter}
      </pre>
    </div>
  )
}

class Creator extends React.Component {
  constructor(props) {
    super(props);

    // Load all data from json files
    this.data = this.props.data

    this.steps = [
      {name: 'origin', status: 1},
      {name: 'career', status: 0},
      {name: 'abilities', status: 0},
      {name: 'class', status: 0},
      {name: 'buy_gear', status: 0},
      {name: 'level_up', status: 0},
      {name: 'next_steps', status: 0}
    ]
    this.character = {
      name: null,
      age: null,
      features: []
    }
    Object.entries(this.data.baseCharacterValues).forEach(([k,v]) => {this.character[k] = v})

    // Begin with a blank slate. Update this in the future to be able to load a character.
    this.state = {
      editingName: false,
      openStep: null
    };
  }

  openStep(stepName) {
    this.setState(state => {
      state.openStep = stepName
      return state;
    });
  }

  closeStep() {
    this.setState(state => {
      state.openStep = null;
      return state;
    });
  }

  saveStep(result, stepName) {
    // Remove all existing features from character for the given step. New features will override it.
    this.character.features = this.character.features.filter(f => f.step !== stepName)

    // Update the step statuses
    var updateNext = false
    this.steps.forEach(step => {
      if (step.name === stepName) {
        step.status = 2;
        updateNext = true;
      } else if (updateNext) {
        if (step.status === 0) {
          step.status = 1;
        }
        updateNext = false;
      }
    });

    const newFeatures = []
    Object.entries(result).forEach( ([key,value]) => {
      switch (key) {
        case 'features':
          value.forEach(f => {
            f.step = stepName;
            newFeatures.push(f);
          });
          break;
        default:
          this.character[key] = value
          break;
      }
    })
    newFeatures.forEach(f => this.character.features.push(f))
    console.log(this.character)
    this.buildCharacter();
    this.closeStep();
  }

  saveCharacterName(name) {
    this.character.name = name;
    this.setState(state => {
      state.editingName = false;
      return state;
    });
  }


  // Make all the calculations for the character based on raw values and features
  buildCharacter() {

    // Create a copy of the current character and reset its base values (no features, augmentations, or equipment)
    const character = this.character
    Object.entries(this.data.baseCharacterValues).forEach(([k,v]) => {
      // Need to deep copy the base values otherwise they get overwritten
      character[k] = JSON.parse(JSON.stringify(v));
    })

    function adjustProficiencies(proficiencyType, proficiencies) {
      proficiencies.forEach(p => {
        if (!character[proficiencyType].includes(p)) {
          character[proficiencyType].push(p);
        }
      })
    }

    // - Go through every feature on the character and adjust character values
    character.features.forEach(feature => {
      // Static features
      feature.types.forEach(type => {
        switch (type) {
          case "age":
            character.age_range = feature.age;
            break;
          case "base_speed":
            character.base_speed = feature.speed
            break
          case "climb_speed":
            character.climb_speed = feature.speed
            break
          case "asi":
            if (character.abilityScores) {
              feature.ability_score_increase.forEach(asi => {
                character.abilityScores[asi.ability] += asi.increase;
              })
            }
            break;
          case "skill_proficiency":
            adjustProficiencies('skill_proficiencies', feature.skill_proficiencies);
            break;
          case "tool_proficiency":
            adjustProficiencies('tool_proficiencies', feature.tool_proficiencies);
            break;
          case "weapon_proficiency":
            adjustProficiencies('weapon_proficiencies', feature.weapon_proficiencies);
            break;
          case "armor_proficiency":
            adjustProficiencies('armor_proficiencies', feature.armor_proficiencies);
            break;
          case "language_proficiency":
            adjustProficiencies('languages', feature.languages);
            break
          case "darkvision":
            const existingDarkvision = character.senses.filter(sense => sense.type === 'darkvision')
            if (existingDarkvision.length > 0)
              character.senses = character.senses.map(sense => {
                if (sense.type !== 'darkvision' || sense.range > feature.darkvision_range) {
                  return sense;
                } else {
                  return {'type': 'darkvision', 'range': feature.darkvision_range}
                }
              })
            else {
              character.senses.push({'type': 'darkvision', 'range': feature.darkvision_range})
            }
            break;
          case "weapon_override":
            character.weapon_overrides[feature.weapon_type] = feature.weapon_override
            break;
          case "natural_armor":
            character.natural_armor = feature.natural_base_ac
            break;
          case "damage_resistance":
            adjustProficiencies('damage_resistances', feature.damage_types)
            break;
          case "bonus_action":
            character.bonus_actions.push({name: feature.name, description: feature.description})
            break;
          default:
            console.log('static: ' + type)
            break;
        }
      })

      // Choices
      if (feature.hasOwnProperty('choices')) {
        feature.choices.forEach(choice => {
          switch(choice.type) {
            case "asi":
              if (this.character.abilityScores) {
                choice.selections.forEach(a => {
                  this.character.abilityScores[a] += choice.increase;
                })
              }
              break;
            case "skill_proficiency":
              adjustProficiencies('skill_proficiencies', choice.selected.map(s => s.key));
              break;
            case "tool_proficiency":
              adjustProficiencies('tool_proficiencies', choice.selected.map(s => s.key));
              break;
            case "weapon_proficiency":
              adjustProficiencies('weapon_proficiencies', choice.selected.map(s => s.key));
              break;
            case "armor_proficiency":
              adjustProficiencies('armor_proficiencies', choice.selected.map(s => s.key));
              break;
            case "language_proficiency":
              adjustProficiencies('languages', choice.selected.map(s => s.key));
              break
            default:
              console.log('choice: ' + choice.type)
              break;
          }
        })
      }
    })

    // - Calculate Ability Scores Mods
    if (!this.character.abilityScores) {
      // NOTE: Everything after this point requires ability modifiers. If that's not set, break here.
      this.character = character;
      return;
    } else {
      character.abilityMods = {}
      Object.entries(this.character.abilityScores).forEach(([ability,score]) => {
        character.abilityMods[ability] = Math.floor((score - 10) / 2)
      })
    }

    // - Calculate AC (based on armor & helmet)
    if (character.armor) {
      const armorStats = this.data.armor[this.character.armor]
      switch (armorStats.category) {
        case "light":
          character.ac = armorStats.base_ac + this.character.abilityMods.dexterity;
          break;
        case "medium":
          character.ac = armorStats.base_ac + Math.max(2, this.character.abilityMods.dexterity);
          break;
        case "heavy":
          character.ac = armorStats.base_ac
          break;
        default:
          character.ac = this.character.natural_armor + this.character.abilityMods.dexterity;
          break;
      }
    } else {
      character.ac = this.character.natural_armor + this.character.abilityMods.dexterity;
    }

    if (character.helmet) {
      const helmetStats = this.data.armor[this.character.helmet]
      character.ac += helmetStats.base_ac
    }

    // NOTE: Everything after this point requires character level. If that's not set, break here.
    if (!character.level) {
      this.character = character;
      return;
    }
    const proficiency_bonus = [2,2,2,2,3,3,3,3,4,4][this.character.level - 1]

    // - Calculate skills (and add passive perception to senses)


    // - Create Attacks (based on weapons)

    // - Calculate carrying capacity

    // - Calculate carried weight and encumbrance

  }

  render() {
    const renderSteps = this.steps.map((step) => {
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
            <Col lg={2}>
              {renderSteps}
            </Col>

            <Col lg={10}>
              <Row><CharacterNameComponent
                name={this.character.name}
                editingName={this.state.editingName}
                onSave={name => this.saveCharacterName(name)} />
              </Row>
              <Row><CharacterDisplay character={this.character} /></Row>
            </Col>
          </Row>

          <OriginStep
            show={this.state.openStep === "origin"}
            current={this.character}
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
            handleSave={result => this.saveStep(result, 'origin')}
          />
        </Container>
      </div>
    )
  }
}

export default Creator;