'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Lagoon key cache
const lagoonKeyCache = 'lagoon.keys';
const lagoonKeyTempKey = 'lagoon-temp.lando.id_rsa';
const lagoonLandoKeyComment = 'lando@' + os.hostname();
let lagoonSites = [];

// Helper to get tokens
const getKeys = (keys = []) => _([])
  .thru(tokens => tokens.concat([{name: 'add or refresh a key', value: 'more'}]))
  .value();

// Helper to determine whether to show list of pre-used tokens or not
const showKeyList = (data, keys = [], tempKey) => {
  return data === 'lagoon' && (!_.isEmpty(keys) || fs.existsSync(tempKey));
};

// Helper to determine whether to show token password entry or not
const showKeyEntry = (data, answer, keys = []) => data === 'lagoon' && (_.isEmpty(keys) || answer === 'more');

/*
 * Init lagoon
 */
module.exports = {
  name: 'lagoon',
  options: lando => ({
    'lagoon-auth': {
      describe: 'A Lagoon account',
      string: true,
      interactive: {
        type: 'list',
        choices: () => {

          // If we have a temp key then lets try to auth
          // if success then add account data to cache and delete temp key
          // if fail then just move on without erroring
          return lando.Promise.resolve(lagoonKeyTempKey)
          .then(key => {
            console.log(key);
            return getKeys(lando.cache.get(lagoonKeyCache))
          })

          // @TODO: auth method to "add key"
          // return getKeys(lando.cache.get(lagoonKeyCache))
        },
        message: 'Select a Lagoon account',
        when: answers => showKeyList(
          answers.recipe,
          lando.cache.get(lagoonKeyCache),
          path.join(lando.config.userConfRoot, 'keys', lagoonKeyTempKey)
        ),
        weight: 510,
      },
    },
  }),
  overrides: {
    // Set a temporary name that we override later
    name: {
      when: answers => {
        answers.name = _.uniqueId('lagooninit');
        return false;
      },
    },
    webroot: {
      when: () => false,
    },
  },
  sources: [{
    name: 'lagoon',
    label: 'lagoon',
    overrides: {
      recipe: {
        when: answers => {
          answers.recipe = 'lagoon';
          return false;
        },
      },
    },
    build: (options, lando) => {
      // If there is no key or account passed in then we need to run the generate/validate step
      if (!_.has(options, 'lagoonAuth')) {
        return [
          {name: 'generate-key', cmd: `/helpers/generate-key.sh ${lagoonKeyTempKey} ${lagoonLandoKeyComment}`},
          {name: 'print-key', cmd: `/helpers/lagoon-showkey.sh ${lagoonKeyTempKey}.pub`},
        ];
      }



      // Get the api client with the passed in auth
      /*
      const api = new PlatformshApiClient({api_token: _.trim(options['platformsh-auth'])});
      return [
        {name: 'generate-key', cmd: `/helpers/generate-key.sh ${platformshLandoKey} ${platformshLandoKeyComment}`},
        {name: 'post-key', func: (options, lando) => {
          const pubKeyPath = path.join(lando.config.userConfRoot, 'keys', `${platformshLandoKey}.pub`);
          const pubKeyData = _.trim(fs.readFileSync(pubKeyPath, 'utf8'));
          const keyName = options['platformsh-key-name'];
          return api.addSshKey(pubKeyData, keyName).catch(err => {
            lando.log.verbose('Could not post key %s', keyName, err);
          });
        }},
        {name: 'get-git-url', func: (options, lando) => {
          // Get the account info
          return api.getAccountInfo()
          // Find and return the project id
          .then(me => {
            const project = _.find(me.projects, {name: options['platformsh-site']});
            return project.id;
          })
          // Get information about the project itself
          .then(id => api.getProject(id))
          // Set the git stuff
          .then(site => api.getAccessToken().then(token => {
            options['url'] = site.repository.url;
            options['ssh'] = site.repository.url.split(':')[0];
            options['token'] = token.access_token;
          }));
        }},
        {name: 'reload-keys', cmd: '/helpers/load-keys.sh --silent', user: 'root'},
        {
          name: 'clone-repo',
          cmd: options => `/helpers/psh-clone.sh ${options['url']} ${options['ssh']} ${options['token']}`,
          remove: 'true',
        },
      ];
      */
    },
  }],
  build: (options, lando) => {
    // @TODO: need to be able to exit here if we dont have a key
    console.log(options);
    process.exit(1)
    // Path to lagoonfile
    const lagoonFile = path.join(options.destination, '.lagoon.yml');
    // Error if we don't have a lagoon.yml
    if (!fs.existsSync(lagoonFile)) {
      throw Error(`Could not detect a .lagoon.yml at ${options.destination}`);
    }
    // Parse the Lagoon config
    const lagoonConfig = lando.yaml.load(lagoonFile);

    // Throw an error if there is no project set
    if (!_.has(lagoonConfig, 'project')) {
      throw Error('Lando currently requires that a project be set in your .lagoon.yml!');
    }

    // Set this so it shows correctly after init
    options.name = lagoonConfig.project;
    // Always reset the name based on the lagoon project
    return {
      name: options.name,
      config: {build: ['composer install']},
    };
  },
};
