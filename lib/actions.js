import request from 'request-promise'

import config from './config'

const GOOGLE_API = 'https://www.googleapis.com/civicinfo/v2/representatives'

function parsePoliticians (gcivicresp) {
  if (!gcivicresp.officials || !gcivicresp.offices) {
    return null
  }

  let politicians = gcivicresp.officials
  for (let office of gcivicresp.offices) {
    for (let idx of office.officialIndices) {
      politicians[idx].office = office
    }
  }
  return politicians
}

const issueToPhrase = {
  health_care: 'healthcare reform',
  gun_control: 'gun control',
  environment: 'the environment'
}

const intentToProcessor = {
  record_issue: async function ({stateManager, inboundMessage}) {
    stateManager.data.issue = inboundMessage.payload.issue
    return {
      intent: 'select_location'
    }
  },
  record_location: async function ({stateManager, inboundMessage}) {
    const location = inboundMessage.location
    let address = inboundMessage.text

    if (location) {
      address = `${location.lat},${location.long}`
    }
    const uri = `${GOOGLE_API}?address=${address}&includeOffices=true&levels=country&roles=legislatorLowerBody&roles=legislatorUpperBody&key=${config.GOOGLE_API_KEY}`
    console.log("google_request", uri)
    const politicians = await request({
      uri,
      json: true,
      simple: false
    })

    const parsedPoliticians = parsePoliticians(politicians)

    if (!parsedPoliticians) {
      return {
        intent: 'reenter_location'
      }
    }

    stateManager.data.location = location
    stateManager.data.address = address
    stateManager.data.politicians = parsedPoliticians

    return {
      intent: 'show_politicians',
      template: {
        politicians: stateManager.data.politicians.map(function (pol, idx) {
          return {
            name: pol.name,
            office: pol.office.name,
            party: pol.party,
            image: pol.photoUrl,
            idx
          }
        })
      }
    }
  },
  learn_more: function ({stateManager, inboundMessage}) {
    const pol_idx = inboundMessage.payload.pol_idx
    const pol = stateManager.data.politicians[pol_idx]

    stateManager.data.pol_idx = pol_idx

    console.log("lm", pol_idx, pol)

    return {
      template: {
        issue_name: issueToPhrase[stateManager.data.issue],
        politician_name: pol.name,
        factoids: [
          { text: 'in the 2016 election cycle...' },
          { text: `${pol.name} got $1000000 from the NRA` },
          { text: `${pol.name} got $2000000 from pro-gun interest groups` }
        ],
        exit_text: 'we can do better, yeah?',
        exit_button: 'okay',
        next_intent: 'bad_pol_folloup',
        politican_number: pol.phones[0]
      }
    }
  }
}

export default async function actionProcessor ({intent, stateManager, inboundMessage}) {
  const processor = intentToProcessor[intent]
  if (processor) {
    const res = await processor({stateManager, inboundMessage})
    return res
  }
  return {}
}
