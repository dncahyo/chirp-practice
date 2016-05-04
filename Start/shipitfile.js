module.exports = function (shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-pm2-nginx')(shipit);

  var conf = {
    default: {
      name: 'chirp-practice',
      nginx: {
        servername: 'meanchirp.dncahyo.me',
      },
      pm2: {
        conf: {
          watch: true,
          script: 'Start/app.js'
        }
      },
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      repositoryUrl: 'https://github.com/dncahyo/chirp-practice.git',
      ignores: ['.git', 'Start/node_modules', 'Start/app.env'],
      rsync: ['--del'],
      key: '/home/dncahyo/.ssh/id_rsa',
      keepReleases: 2,
      shallowClone: true
    },
    staging: {
      servers: 'deploy@dncahyo.me'
    }
  };

  shipit.initConfig(conf);

  
  shipit.on('updated', function () {
    var path = conf.default.deployTo + "/Start";
    return shipit.remote('echo $PATH && cd ' + path + ' && npm install && npm ls -depth 0');
  });
};
