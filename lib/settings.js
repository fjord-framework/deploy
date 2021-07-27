const fs = require('fs');
const path = require('path');

const ENDLINE = "        --------------------------------------"

const VALID_SECURITY_OPTIONS = ['SASL-plain', 'none']

function getSettings() {
  let s; // settings

  console.log()
  console.log("        ------- Loading Fjord Settings -------")
  try {
    s = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../FjordSettings.json')));
    console.log("1. FjordSettings.json file successfully accessed")
  } catch {
    console.log("Error while trying to access FjordSettings.json")
    console.log("  1a) Make sure the FjordSettings.json file is placed directly inside the /FjordApp folder")
    console.log("  1b) Make sure the FjordSettings.json file is correctly spelled")
    console.log("  1c) Make sure the FjordSettings.json file contains valid json format")
    console.log(ENDLINE)
    throw new Error("Could not find FjordSettings.json file. Check logs above.")
  }
  if (!s.name) s.name = 'Fjord App'
  try {
    if (!s.server || typeof s.server !== 'object') throw new Error('Fjord settings -- missing server param')
    if (!s.server.NAME) s.server.NAME = 'Server'
    if (!s.server.JWT_KEY || typeof s.server.JWT_KEY !== 'string' || s.server.JWT_KEY.length < 20) throw new Error('Fjord settings -- missing or incorrect server JWT_KEY (must be string of at least 20 chars)')
    if (!s.server.SEC_PER_PULSE) s.server.SEC_PER_PULSE = '30'
    console.log('2. Server params successfully loaded for ' + s.server.NAME)
    if (!s.consumerGroups || !Array.isArray(s.consumerGroups)) throw new Error('Fjord settings -- missing or incorrect consumerGroups param (must be an array)')
    if (!s.consumerGroups.length) throw new Error('Fjord settings -- consumerGroups must contain at least one consumer group')
    s.consumerGroups.forEach((c, idx) => {
      if (!c.KAFKA_TOPICS || typeof c.KAFKA_TOPICS !== 'string') throw new Error(`Fjord settings -- consumerGroups -- consumer group #${idx+1} is missing a valid KAFKA_TOPICS param (must be a string of space-separated topics)`);
      const kafkaTopicsArr = c.KAFKA_TOPICS.split(' ');
      c.kafkaTopicsNum = kafkaTopicsArr.length
      if (!c.BROKERS || !c.BROKERS.length) throw new Error(`Fjord settings -- consumerGroups -- consumer group #${idx+1} is missing a valid BROKERS param`)
      if (!c.SECURITY || !VALID_SECURITY_OPTIONS.includes(c.SECURITY)) {
        throw new Error(`Fjord settings -- consumerGroups -- consumer group #${idx+1} is missing a valid SECURITY param (${VALID_SECURITY_OPTIONS.map(p => '"' + p + '"').join(' or ')})`)
      }
      if (c.SECURITY === 'SASL-plain') {
        if (!c.KAFKA_USERNAME || !c.KAFKA_USERNAME.length) {
          throw new Error(`Fjord settings -- consumerGroups -- consumer group #${idx+1} is missing a valid KAFKA_USERNAME param)`)
        }
        if (!c.KAFKA_PASSWORD || !c.KAFKA_PASSWORD.length) {
          throw new Error(`Fjord settings -- consumerGroups -- consumer group #${idx+1} is missing a valid KAFKA_PASSWORD param)`)
        }
      }
      if (!c.NAME) c.NAME = c.KAFKA_TOPICS.replace(/ /g,'')
      if (!c.API_TOPICS) {
        c.API_TOPICS = c.KAFKA_TOPICS
      } else if (c.API_TOPICS.split(' ').length < c.kafkaTopicsNum) {
        let apiTopicsCount = c.API_TOPICS.split(' ').length
        while (apiTopicsCount < c.kafkaTopicsNum) {
          if (apiTopicsCount > 0) c.API_TOPICS += ' '
          c.API_TOPICS += kafkaTopicsArr[apiTopicsCount]
          apiTopicsCount++
        }
      }
      if (!c.CONSUMER_GROUP) c.CONSUMER_GROUP = 'fjord-' + c.NAME
      if (!c.FROM_BEGINNINGS) {
        c.FROM_BEGINNINGS = kafkaTopicsArr.map(t => 'false').join(' ')
      } else if (c.FROM_BEGINNINGS.split(' ').length < c.kafkaTopicsNum) {
        let fromBeginningsCount = c.FROM_BEGINNINGS.split(' ').length
        while (fromBeginningsCount < c.kafkaTopicsNum) {
          if (fromBeginningsCount > 0) c.FROM_BEGINNINGS += ' '
          c.FROM_BEGINNINGS += 'false'
          fromBeginningsCount++
        }
      }
      if (!c.KAFKA_USERNAME) c.KAFKA_USERNAME = ''
      if (!c.KAFKA_PASSWORD) c.KAFKA_PASSWORD = ''
      if (!c.MEMBERS_COUNT) c.MEMBERS_COUNT = '1'
      if (!c.CONCURRENT_PARTITIONS) c.CONCURRENT_PARTITIONS = '1'
      if (!c.STARTING_DELAY_SEC) c.STARTING_DELAY_SEC = '0'
    })
    console.log('3. Consumergroups params successfully loaded (' + s.consumerGroups.length + ` consumer group${s.consumerGroups.length > 1 ? 's' : ''})`);
    s.consumerGroups.forEach((c, idx) => {
      console.log(`    3.${idx+1} ${c.NAME}: ${c.kafkaTopicsNum} topic${c.kafkaTopicsNum > 1 ? 's' : ''}`)
    });
    console.log("4. All Settings for " + s.name + ' successfully loaded! See below for template.')
  } catch(err) {
    console.log()
    console.log(err)
    console.log()
    throw new Error('Incorrect Fjord settings parameters. Check logs above.')
  } finally {
    console.log(ENDLINE)
    console.log()
  }
  s.consumerGroups.forEach(c => {
    delete c.kafkaTopicsNum
  })
  console.log(s)
  return s
}

module.exports = getSettings;