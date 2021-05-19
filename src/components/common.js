import React from 'react'
import parse from 'html-react-parser'

import { Row, Col, Button, Card } from 'react-bootstrap'
import { Multiselect } from "multiselect-react-dropdown";

class FeatureCardSelections extends React.Component {
  constructor(props) {
    super(props);
    this.preselected = props.preselected
    this.choices = props.choices
    this.displayTitle = props.title
    this.limit = props.limit
  }

  handleOnSelect(selectedList, selectedItem) {
    console.log(selectedList)
    console.log(selectedItem)
  }

  handleOnRemove(selectedList, removedItem) {
    console.log(selectedList)
    console.log(removedItem)
  }

  render() {
    return (
      <div>
        <h6>{this.displayTitle}</h6>
        <Multiselect 
          options={this.choices}
          disablePreselectedValues={true}
          onSelect={this.handleOnSelect}
          onRemove={this.handleOnRemove}
          selectionLimit={this.limit}
          selectedValues={this.preselected}
          displayValue="displayName"
          showCheckbox={true}
        />
      </div>
    )
  }
}

class FeatureCard extends React.Component {
  constructor(props) {
    super(props);
    this.featureTypes = this.props.feature.types;
    this.data = this.props.data;
  }

  renderChoicesByType(type) {
    if (type == 'augmentations') return <div/>
    if (!this.props.feature.hasOwnProperty('choices')) {
      return <div />
    }
    const choices = this.props.feature.choices
    console.log(choices)

    if (choices.length === 0) {
      return <div />
    }

    return (
      choices.map(choice => {
        switch (choice.type) {
          case "asi":
            const abilityScores = Object.entries(this.data.abilityScores).map( ([k,v]) => {
              return {"id": k, "displayName": v.name};
            }).filter(a => !choice.excludes.includes(a.id))
            var display = 'Select '
            if (choice.num_abilities === 1) {
              display += 'an ability score to increase by ' + choice.increase
            } else {
              display += choice.num_abilities + ' ability scores to increase by ' + choice.increase
            }
            return (
              <FeatureCardSelections
                title={display}
                choices={abilityScores}
                preselected={[]}
                limit={choice.num_abilities}
              />)
          case "language_proficiency":
            const languages = Object.entries(this.data.languages).map(([k,v]) => {
              return { "id": k, "displayName": v.name }
            }).filter(l => !choice.excludes.includes(l.id));
            var display = 'Select '
            if (choice.num_languages === 1) {
              display += 'a language'
            } else {
              display += choice.num_languages + ' languages'
            }
            return (
              <FeatureCardSelections
                title={display}
                choices={languages}
                preselected={[]}
                limit={choice.num_skills}
              />)
          case "skill_proficiency":
            const skills = Object.entries(this.data.skills).map(([k,v]) => {
              const displayName = v.name + ' (' + this.data.abilityScores[v.ability].shortName + ')'
              return {"id": k, "displayName": displayName}
            }).filter(s => !choice.excludes.includes(s.id));
            var display = 'Select '
            if (choice.num_skills === 1) {
              display += 'a skill'
            } else {
              display += choice.num_skills + ' skills'
            }
            return (
              <FeatureCardSelections
                title={display}
                choices={skills}
                preselected={[]}
                limit={choice.num_skills}
              />)
          case "tool_proficiency":
            const tools = Object.entries(this.data.tools).map(([k,v]) => {
              return {"id": k, "displayName": v.name}
            }).filter(t => !choice.excludes.includes(t.id));
            var display = 'Select '
            if (choice.num_tools === 1) {
              display += 'a tool'
            } else {
              display += choice.num_tools + ' tools'
            }
            return (
              <FeatureCardSelections
                title={display}
                choices={tools}
                preselected={[]}
                limit={choice.num_tools}
              />)
          default:
            return <div />
        }
      })
    );
  }


  render() {
    const descriptionComponent = parse(this.props.feature.description);
    const choices = this.featureTypes.map(t => this.renderChoicesByType(t))

    return (
      <Card className="featureCard">
        <Card.Title>{this.props.feature.name}</Card.Title>
        <Card.Body>
          <Row>{descriptionComponent}</Row>
          <Row>{choices}</Row>
        </Card.Body>
      </Card>
    )
  }
}

function FeatureList(props) {
  return props.features.map(
    feature => {
      return (
        <Row>
          <FeatureCard
            feature={feature}
            data={props.data}
            onUpdate={feature => props.onUpdate(feature)}
          />
        </Row>
      )
    }
  )
}

function Description(props) {
  if (props.name === null) {
    return <div />;
  }
  const descriptionComponent = parse(props.description);
  return (
    <div className="description">
      <h2>{props.name}</h2>
      {descriptionComponent}
    </div>
  )
}

function SaveButton(props) {
  
  if (props.enabled) {
    return <Button className="saveButton" variant="primary" onClick={props.onClick}>
            {props.value}
          </Button>
  } else {
    return <Button className="saveButton" variant="primary" disabled>{props.value}</Button>
  }
}

function OptionSelector(props) {
  const variant = props.selected ? "primary" : "outline-primary"
  return <Button className="selector" variant={variant} onClick={props.onClick}>{props.value}</Button>
}

function OptionList(props) {
  const options = Object.keys(props.options)
  return options.map(
    option => {
      return (
        <Row>
          <OptionSelector 
            value={props.options[option].name}
            selected={option === props.selected}
            onClick={() => props.onClick(option)}
          />
        </Row>
      )
    }
  )
}

export { FeatureList, Description, SaveButton, OptionList }