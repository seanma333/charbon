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
    this.character = this.getBaseCharacter()
    this.character.name = null
    this.character.age = null
    this.character.features = []

    // Begin with a blank slate. Update this in the future to be able to load a character.
    this.state = {
      editingName: false,
      openStep: null
    };
  }

  getBaseCharacter() {
    const char = JSON.parse(JSON.stringify(this.data.baseCharacterValues))
    // Set all base ability scores to 10. 
    // TODO: Remove this once the ability score step is added.
    char.baseAbilities = {}
    Object.keys(this.data.abilityScores).map(a => char.baseAbilities[a] = 10)

    // Set level to 1.
    // TODO: remove this once the class step is added.
    char.level = 1

    return char
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
    // Create the base character (no features, augmentations, or equipment)
    // This is what will be modified for tne new build.
    const build = this.getBaseCharacter()

    // Very common: list of proficiencies can be updated from multiple places
    function adjustProficiencies(proficiencyType, proficiencies) {
      proficiencies.forEach(p => {
        if (!build[proficiencyType].includes(p)) {
          build[proficiencyType].push(p);
        }
      })
    }

    // Set the character ability scores to the base level (determined in ability score step).
    // Also copy over the baseAbilities for future updates.
    if (this.character.baseAbilities) {
      build.baseAbilities = {}
      build.abilityScores = {}
      Object.entries(this.character.baseAbilities).forEach(([ability, score]) => {
        build.baseAbilities[ability] = score;
        build.abilityScores[ability] = score;
      });
    }

    // - Go through every feature on the character and adjust character values
    this.character.features.forEach(feature => {
      // Static features
      feature.types.forEach(type => {
        switch (type) {
          case "age":
            build.age_range = feature.age;
            break;
          case "base_speed":
            build.base_speed = feature.speed
            break
          case "climb_speed":
            build.climb_speed = feature.speed
            break
          case "asi":
            if (build.abilityScores) {
              console.log(build.abilityScores)
              feature.ability_score_increase.forEach(asi => {
                build.abilityScores[asi.ability] += asi.increase;
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
            const existingDarkvision = build.senses.filter(sense => sense.type === 'darkvision')
            if (existingDarkvision.length > 0)
              build.senses = build.senses.map(sense => {
                if (sense.type !== 'darkvision' || sense.range > feature.darkvision_range) {
                  return sense;
                } else {
                  return {type: 'darkvision', range: feature.darkvision_range}
                }
              })
            else {
              build.senses.push({'type': 'darkvision', 'range': feature.darkvision_range});
            }
            break;
          case "weapon_override":
            build.weapon_overrides[feature.weapon_type] = feature.weapon_override;
            break;
          case "natural_armor":
            build.natural_armor = feature.natural_base_ac;
            break;
          case "damage_resistance":
            adjustProficiencies('damage_resistances', feature.damage_types);
            break;
          case "bonus_action":
            build.bonus_actions.push({name: feature.name, description: feature.description});
            break;
          case "influence":
            Object.entries(feature.influence).forEach(([type,value]) => {
              build.baseInfluence[type] = Math.max(build.baseInfluence[type], value)
            });
            break;
          default:
            console.log('Missing static: ' + type)
            break;
        }
      })

      // Choices
      if (feature.hasOwnProperty('choices')) {
        feature.choices.forEach(choice => {
          switch(choice.type) {
            case "asi":
              if (this.build.abilityScores) {
                choice.selections.forEach(a => {
                  this.build.abilityScores[a] += choice.increase;
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
              console.log('Missing choice: ' + choice.type)
              break;
          }
        })
      }
    })

    // - Calculate Ability Scores Mods
    if (!build.abilityScores) {
      // NOTE: Everything after this point requires ability modifiers. If that's not set, break here.
      this.character = build;
      return;
    } else {
      build.abilityMods = {}
      Object.entries(build.abilityScores).forEach(([ability,score]) => {
        build.abilityMods[ability] = Math.floor((score - 10) / 2)
      })
    }

    // - Calculate AC (based on armor & helmet)
    build.armor = this.character.armor
    build.helmet = this.character.helmet
    if (build.armor) {
      const armorStats = this.data.armor[build.armor]
      switch (armorStats.category) {
        case "light":
          build.ac = armorStats.base_ac + build.abilityMods.dexterity;
          break;
        case "medium":
          build.ac = armorStats.base_ac + Math.max(2, build.abilityMods.dexterity);
          break;
        case "heavy":
          build.ac = armorStats.base_ac
          break;
        default:
          build.ac = build.natural_armor + build.abilityMods.dexterity;
          break;
      }
    } else {
      build.ac = build.natural_armor + build.abilityMods.dexterity;
    }

    if (build.helmet) {
      const helmetStats = this.data.armor[build.helmet]
      build.ac += helmetStats.base_ac
    }

    // NOTE: Everything after this point requires character level (including proficiency bonus).
    // If that's not set, break here.
    build.level = this.character.level
    if (!build.level) {
      this.character = build;
      return;
    }
    const proficiency = [2,2,2,2,3,3,3,3,4,4][Math.max(build.level - 1, 0)]

    // - Calculate skill proficiencies (including half and expertise) (and add passive perception to senses)
    build.skillMods = {}
    Object.entries(this.data.skills).forEach(([skill,data]) => {
      const halfBonus = build.skill_half_proficiencies.includes(skill) ? Math.round(proficiency / 2) : 0;
      const profBonus = build.skill_proficiencies.includes(skill) ? proficiency : 0;
      const expertiseBonus = build.skill_expertise.includes(skill) ? (2 * proficiency) : 0;

      build.skillMods[skill] = Math.max(halfBonus, profBonus, expertiseBonus);
    });

    // - Create Attacks (based on weapons)
    build.weapons = this.character.weapons
    build.attacks = build.weapons.map(w => {
      const weapon = JSON.parse(JSON.stringify(this.data.weapons[w.type]))

      // Apply weapon override
      if (build.weapon_overrides[w.type]) {
        Object.entries(build.weapon_overrides[w.type]).forEach(([prop,override]) => {
          console.log(prop)
          console.log(override)
          weapon[prop] = override;
          console.log(weapon)
        })
      }

      var abilityMod = build.abilityMods.dexterity; // Most weapons are light guns in Carbon 2185, so we'll use DEX as a default
      if (['melee','unarmed','heavy_weapons'].includes(weapon.category)) {
        abilityMod = weapon.properties.includes('finesse') ? Math.max(build.abilityMods.strength, build.abilityMods.dexterity) : build.abilityMods.strength
      }

      const proficiencyMod = build.weapon_proficiencies.some(p => {
        return (p.category === weapon.category) || (p.type === w.type)
      }) ? proficiency : 0;

      // TODO: Add other bonuses, but we'll start with this basic one for now
      const attackBonus = abilityMod + proficiencyMod
      const damageRoll = weapon.damage_dice + '+' + abilityMod

      return {
        type: w.type,
        name: weapon.name,
        attackBonus: attackBonus,
        damageRoll: damageRoll,
        damageType: weapon.damage_type,
        range: weapon.range
      }
    })

    // TODO: Two-Weapon Fighting

    // - Calculate carrying capacity

    // - Calculate carried weight and encumbrance

    // Finished!
    this.character = build
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