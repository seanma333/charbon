import React from 'react'
import parse from 'html-react-parser'

import { Row, Button, Card } from 'react-bootstrap'
import { Multiselect } from "multiselect-react-dropdown";

function initializeFeature(feature, source) {
  // Generate an id for the feature based on its name and source
  feature.id = source + '_' + feature.name.toLowerCase().replaceAll(' ', '_')
  if (feature.hasOwnProperty('choices')) {
    feature.complete = false
    feature.choices = feature.choices.map(choice => {
      choice.selected = [];
      return choice;
    });
  } else {
    feature.complete = true
  }
  return feature
}

function FeatureCardSelections(props) {
  return (
    <div>
      <h6 key='title'>{props.title}</h6>
      <Multiselect 
        key={props.id}
        options={props.choices}
        onSelect={props.onUpdate}
        onRemove={props.onUpdate}
        selectionLimit={props.limit}
        selectedValues={props.preselected}
        displayValue="displayName"
        showCheckbox={true}
        avoidHighlightFirstOption={true}
        hidePlaceholder={true}
        closeOnSelecte={false}
      />
    </div>
  )
}

class FeatureCard extends React.Component {
  constructor(props) {
    super(props);
    this.data = this.props.data;
    this.feature = this.props.feature
    this.onUpdate = this.props.onUpdate
    this.featureTypes = this.feature.types
    this.state = {
      complete: this.complete
    }
  }

  updateFeatureState() {
    if (!this.feature.hasOwnProperty('choices')) return;

    if (this.feature.choices.every(c => {
      switch (c.type) {
        case "asi":
          return c.num_abilities === c.selected.length;
        case "language_proficiency":
          return c.num_languages === c.selected.length;
        case "skill_proficiency":
          return c.num_skills === c.selected.length;
        case "tool_proficiency":
          return c.num_tools === c.selected.length;
        default:
          return true;
      }
    })) {
      this.feature.complete = true;
    } else {
      this.feature.complete = false;
    }
    this.setState(state => {
      state.complete = this.feature.complete;
      return state;
    })

    this.props.onUpdate(this.feature)
  }

  renderChoices() {
    if (!this.feature.hasOwnProperty('choices')) {
      return <div />
    }

    if (this.feature.choices.length === 0) {
      return <div />
    }

    return (
      this.feature.choices.map(choice => {
        var display = 'Select ';
        var choices = [];
        var preselected = choice.selected;
        var limit = null;

        switch (choice.type) {
          case "asi":
            choices = Object.entries(this.data.abilityScores).map( ([k,v]) => {
              return {"key": k, "displayName": v.name};
            }).filter(a => !choice.excludes.includes(a.key));
            limit = choice.num_abilities;
            if (limit === 1) {
              display += 'an ability score to increase by ' + choice.increase;
            } else {
              display += choice.num_abilities + ' ability scores to increase by ' + choice.increase;
            }
            break;
          case "language_proficiency":
            choices = Object.entries(this.data.languages).map(([k,v]) => {
              return { "key": k, "displayName": v.name };
            }).filter(l => !choice.excludes.includes(l.key));
            limit = choice.num_languages;
            if (limit === 1) {
              display += 'a language';
            } else {
              display += choice.num_languages + ' languages';
            }
            break;
          case "skill_proficiency":
            choices = Object.entries(this.data.skills).map(([k,v]) => {
              const displayName = v.name + ' (' + this.data.abilityScores[v.ability].shortName + ')';
              return {"key": k, "displayName": displayName}
            }).filter(s => !choice.excludes.includes(s.key));
            limit = choice.num_skills;
            if (limit === 1) {
              display += 'a skill';
            } else {
              display += choice.num_skills + ' skills';
            }
            break;
          case "tool_proficiency":
            choices = Object.entries(this.data.tools).map(([k,v]) => {
              return {"key": k, "displayName": v.name}
            }).filter(t => !choice.excludes.includes(t.key));
            limit = choice.num_tools;
            if (limit === 1) {
              display += 'a tool';
            } else {
              display += choice.num_tools + ' tools';
            }
            break;
          default:
            return <div />
        }
        return (
          <FeatureCardSelections
            id={this.feature.id}
            title={display}
            choices={choices}
            preselected={preselected}
            limit={limit}
            onUpdate={(selections) => {
              choice.selected = selections;
              this.updateFeatureState();
            }}
          />
        )
      })
    );
  }


  render() {
    const descriptionComponent = parse(this.feature.description);
    const choices = this.renderChoices()
    const border = this.feature.complete ? 'primary' : 'secondary'

    return (
      <div key={this.feature.id}>
        <Card border={border} className="feature-card">
          <Card.Title>{this.feature.name}</Card.Title>
          <Card.Body>
            <Row key='description'>{descriptionComponent}</Row>
            <Row key='choices'>{choices}</Row>
          </Card.Body>
        </Card>
      </div>
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
            onUpdate={props.onUpdate}
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
        <Row key={option}>
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

export { FeatureList, FeatureCard, Description, SaveButton, OptionList, initializeFeature }