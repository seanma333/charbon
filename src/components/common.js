import React from 'react'
import parse from 'html-react-parser'

import { Row, Button, Card } from 'react-bootstrap'

// Make an update to a character based on a set of updates
function updateCharacter(character, updates) {
  return character
}

function FeatureCard(props) {
  console.log(props)
  const descriptionComponent = parse(props.description);
  return (
      <Card className="featureCard">
        <Card.Title>{props.name}</Card.Title>
        <Card.Body>{descriptionComponent}</Card.Body>
      </Card>
    )
}

function FeatureList(props) {
  return props.features.map(
    feature => {
      return (
        <Row>
          <FeatureCard name={feature.name} description={feature.description} />
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