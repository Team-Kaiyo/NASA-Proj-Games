import parse from 'html-react-parser'
import React, {Component} from 'react'

import Grid from '@mui/material/Grid'

import GeneralFormik from '../GeneralFormik/GeneralFormik'

import PlaceIcon from '@mui/icons-material/Place'

import './PredictiveText.scss'

class PredictiveText extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      suggestions: [],
      transcriptLength: 0,
      transcript: '',
      highlightedText: '',
    }

    this.data = {
      to: [
        {
          key: 'home',
          details: '20 Glenbrook Dr, Hillsborough CA 92591',
        },
        {
          key: 'work',
          details: '400 S El Camino Real San Mateo, CA 92591',
        },
      ],
      from: [
        {
          key: 'Wimpole Pharmacy',
          details: 'pharmacies',
        },
        {
          key: 'JP Pharmacy',
          details: 'pharmacies',
        },
        {
          key: 'Morrisons Pharmacy',
          details: 'pharmacies',
        },
      ],
      a: [
        {
          key: 'schedule',
          details: 'callback',
        },
        {
          key: 'schedule',
          details: 'video conference',
        },
        {
          key: 'schedule',
          details: 'chat',
        },
      ],
    }
    this.handleChange = this.handleChange_.bind(this)

    this.myRef = React.createRef()
  }

  getSchema() {
    let schema = {
      initialValues: {
        command: '',
      },
      fields: [
        {
          type: 'text',
          name: 'command',
          label: '',
          //"validation": yup.string('Enter your email').required("email is required"),
          //"disabled": true
        },
      ],
      buttons: [],
    }

    return schema
  }

  handleChange_(data) {
    let transcript = data.command
    console.log(transcript)

    this.setState({transcript: transcript})

    this.update(transcript)
  }

  initialize() {
    // Elements of the HTML page
    // this.text_input = document.getElementById('SearchBox')
    this.hints = document.getElementById('predictions')
    // this._1st_hint = document.getElementById('first_prediction')
    // this._1st_hint =
    // The data to be used for prediction
    // "to" -> if it full matches then it will show the suggestions of its sub-objects
    //      -> selecting home will add a space and make it "...to home"
    this.predict_assets = {
      to: [
        {
          key: 'home',
          details: '20 Glenbrook Dr, Hillsborough CA 92591',
        },
        {
          key: 'work',
          details: '400 S El Camino Real San Mateo, CA 92591',
        },
      ],
      from: [
        {
          key: 'Wimpole Pharmacy',
          details: 'pharmacies',
        },
        {
          key: 'JP Pharmacy',
          details: 'pharmacies',
        },
        {
          key: 'Morrisons Pharmacy',
          details: 'pharmacies',
        },
      ],
    }

    this.predict_assets_keys = Object.keys(this.predict_assets)
    this.KeywordRegex = new RegExp(
      `(^|\\s)(${this.predict_assets_keys.join('|')})`,
      'gi',
    )
  }

  /**
   * Creates a hint element with the given match, text, details, input element, regex, and new text.
   * @param {string} match - The matched text. (ignored because click disabled)
   * @param {string} text - The original text. (ignored because click disabled)
   * @param {string} details - The details to display in the hint.
   * @param {HTMLElement} input_ele - The input element to attach the hint to. (ignored because click disabled)
   * @param {RegExp} regex - The regular expression used to match the text. (ignored because click disabled)
   * @param {string} new_text - The new text to display in the hint.
   * @returns {HTMLElement} The hint element.
   */
  make_hint(details, new_text) {
    // const li = document.createElement('div')
    // li.className = 'hint'
    // li.innerHTML = `<b>${new_text}</b> <br> <i>${details}<i>`

    const li = (
      <div className="hint">
        <b>{new_text}</b> <br /> <i>{details}</i>
      </div>
    )

    return li
  }

  /**
   * Generates a regular expression pattern for a given string. It matches characters one by one.
   * @param {string} str - The input string to generate the pattern for.
   * @param {boolean} [end=false] - Whether to include an end-of-line anchor in the pattern.
   * @returns {string} The regular expression pattern for the input string.
   */
  make_regex(str, end = false) {
    let i = str.length
    var prev_ptrn = ''
    while (i--) {
      const char = str.charAt(i)
      prev_ptrn = `(${char}${prev_ptrn})?`
    }

    // drop the last ?
    prev_ptrn = prev_ptrn.slice(0, -1)

    if (end) return `(?<res2>${prev_ptrn})\$`
    return `(?<res2>${prev_ptrn})`
  }

  /**
   * Replaces the matched substring in the given text with the specified replacement text.
   * @param {string} text - The input text to be modified.
   * @param {RegExp} regex - The regular expression pattern to match against the input text.
   * @param {string} text2 - The replacement text to be used in place of the matched substring.
   * @returns {string} The modified text with the matched substring replaced by the replacement text.
   */
  swap_text(text, regex, text2) {
    return text.replace(regex, text2)
  }

  /**
   * Updates the first hint text with the given input and new text.
   * @param {string} input - The input text.
   * @param {string} new_text - The new text to be added to the hint.
   */
  update_1st_hint_text(input, new_text) {
    // const _1st_hint = this._1st_hint

    // Get the new suggestion text by splitting the new text by the original keyword.
    const new_part = new_text.slice(input.length, new_text.length)

    // const span = document.createElement('pre')
    // span.className = 'text_hint'
    // span.innerHTML = new_part

    const span = <pre className="text_hint">{new_part}</pre>

    // show the new suggestion text in different color

    // show the full suggestion text
    // _1st_hint.innerHTML = ''
    // _1st_hint.innerText = input // 1st show the input text
    // _1st_hint.appendChild(span) // then show the new suggestion text
    this.myRef.current.innerHTML = input + span
  }

  update(value) {
    const that = this
    var suggestions = []
    this.setState({suggestions: []})

    // const text_input = this.text_input
    // const value = text_input.value
    // this.hints.innerHTML = ''
    // this._1st_hint.innerHTML = ''

    var prediction_made = false

    if (value.length > 0) {
      const matches = value.match(this.KeywordRegex)
      // checks if the input text contains any of the keywords like "to", "from", etc.

      if (!matches) return

      for (let i = 0; i < matches.length; i++) {
        const key = matches[i].trim().toLowerCase()

        // get the next predictions for the keyword
        const predictions = that.predict_assets[key]
        // if the user has written something after the keyword, then show matching with the keyword
        predictions.forEach((prediction) => {
          // make a regex pattern for the keyword to check characters one by one. If rest of part missing then also match. But if typo or mismatch won't work.
          var option = that.make_regex(prediction.key, false)

          // search by the main keyword and the prediction key
          var regex = new RegExp(`(?<space>^|\\s)${key}\\s?(${option}?$)`, 'gi')
          const match2 = regex.exec(value)

          if (match2) {
            // if theres space before the keyword then add space in the final text
            const t = `${match2.groups.space}${key} ${prediction.key}`

            // make a hint element
            const li = that.make_hint(
              key,
              prediction.key,
              prediction.details,
              regex,
              t,
            )

            suggestions.push(li)
            this.setState({suggestions: suggestions}) // update the suggestions

            if (!prediction_made) {
              const new_text = that.swap_text(value, regex, t)

              // update the first hint text (with different color suggestion)
              that.update_1st_hint_text(value, new_text)
              prediction_made = true
            }
          }
        })
      }
    }
  }

  predict() {
    const that = this

    this.text_input.addEventListener('input', (e) => {
      that.update()
    })
  }

  render() {
    return (
      <div className="PredictiveText">
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12}>
            <div className="predictive-text">
              <GeneralFormik
                schema={this.getSchema()}
                submitHandler={this.handleChange}
              />
              <div className="parent-element">
                <span id="first_prediction">
                  <pre>{this.state.transcript}</pre>
                  <pre className="text_hint">{this.state.highlightedText}</pre>
                </span>
              </div>
            </div>
          </Grid>
        </Grid>
        <div id="predictions">
          {this.state.suggestions.map((suggestion) => {
            return suggestion
          })}
        </div>
      </div>
    )
  }
}

export default PredictiveText
