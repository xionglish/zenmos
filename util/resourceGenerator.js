/* Copyright 2018 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the 'License');
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const uuidv4 = require('uuid/v4');
const os = require('os');
const { versionTS } = require('./ptpMaths.js');

const findOne = (type, config) => {
  let a = [];
  if (!config && !config.entries) { return undefined; }
  for ( let [k, v] of config.entries() ) {
    if (k.startsWith(type)) {
      a.push(v.id);
    }
  }
  return a.length > 0 ? a[ Math.random() * a.length | 0 ] : undefined;
};

const selfMaker = config => ({
  version: versionTS(),
  hostname: config.hostname ? config.hostname : os.hostname(),
  caps: {},
  href: 'http://172.29.80.65:12345/',
  api: config.nmosVersion === 'v10' ? undefined : {
    versions: config.versions,
    endpoints: []
  },
  services: [ {
    href: 'http://172.29.80.65:12345/x-manufacturer/pipelinemanager/',
    type: 'urn:x-manufacturer:service:pipelinemanager'
  }, {
    href: 'http://172.29.80.65:12345/x-manufacturer/status/',
    type: 'urn:x-manufacturer:service:status'
  } ],
  label: config.label ? config.label : `${os.hostname()}-label`,
  description: config.description ?
    config.description :
    `${os.hostname()}-description`,
  tags: {},
  id: config.selfID,
  clocks: config.nmosVersion === 'v10' ? undefined : [ {
    name: 'clk0',
    ref_type : 'internal'
  }, {
    name: 'clk1',
    ref_type: 'ptp',
    traceable: true,
    version: 'IEEE1588-2008',
    gmid: '08-00-11-ff-fe-21-e1-b0',
    locked: true
  } ],
  interfaces: config.nmosVersion === 'v10' ? undefined : []
});
const deviceMaker = config => ({
  receivers: [],
  label: 'pipeline 1 default device',
  description: 'pipeline 1 default device',
  tags: {},
  version: versionTS(),
  id: uuidv4(),
  type: 'urn:x-nmos:device:pipeline',
  senders: [],
  node_id: config.selfID,
  controls: config.nmosVersion === 'v10' ? undefined : [ {
    type: 'urn:x-manufacturer:control:generic',
    href: 'ws://182.54.54.75:223'
  }, {
    type: 'urn:x-manufacturer:control:generic',
    href: 'http://134.24.64.22/x-manufacturer/control/'
  }, {
    type: 'urn:x-manufacturer:control:legacy',
    href: 'telnet://120.43.64.3:8080'
  } ]
});
const sourceMaker = config => ({
  description: 'Capture Card Source Video',
  tags: {
    'host': [ 'host1' ]
  },
  format: 'urn:x-nmos:format:video',
  caps: {},
  version: versionTS(),
  parents: [],
  label: 'CaptureCardSourceVideo',
  id: uuidv4(),
  device_id: findOne('device', config),
  clock_name: config.nmosVersion === 'v10' ? undefined : 'clk1'
});
const flowMaker = config => ({
  description: 'Test Card',
  tags: {},
  format: 'urn:x-nmos:format:video',
  label: 'Test Card',
  version: versionTS(),
  parents: [],
  source_id: findOne('sources', config),
  device_id: findOne('devices', config), // TODO make this the sources flow
  id: uuidv4(),
  media_type: config.nmosVersion === 'v10' ? undefined : 'video/raw',
  frame_width: config.nmosVersion === 'v10' ? undefined : 1920,
  frame_height: config.nmosVersion === 'v10' ? undefined : 1080,
  interlace_mode: config.nmosVesion === 'v10' ? undefined : 'interlaced_tff',
  colorspace: config.nmosVesion === 'v10' ? undefined : 'BT709',
  components: config.nmosVesion === 'v10' ? undefined : [ {
    name: 'Y',
    width: 1920,
    height: 1080,
    bit_depth: 10
  }, {
    name: 'Cb',
    width: 960,
    height: 1080,
    bit_depth: 10
  }, {
    name: 'Cr',
    width: 960,
    height: 1080,
    bit_depth: 10
  } ]
});
const senderMaker = config => ({
  description: 'Test Card',
  label: 'Test Card',
  version: versionTS(),
  manifest_href: 'http://172.29.80.65/x-manufacturer/senders/d7aa5a30-681d-4e72-92fb-f0ba0f6f4c3e/stream.sdp',
  flow_id: findOne('flows', config),
  id: uuidv4(),
  transport: 'urn:x-nmos:transport:rtp.mcast',
  device_id: findOne('devices', config),
  interface_bindings: config.nmosVersion === 'v10' ? undefined : [
    'eth0',
    'eth1'
  ],
  caps: {},
  tags: {},
  subscription: {
    receiver_id: null,
    active: config.nmosVersion === 'v10' ? undefined : true
  }
});
const receiverMaker = config => ({
  description: 'RTPRx-description',
  format: 'urn:x-nmos:format:video',
  tags: {},
  caps: {
    media_types: [ 'video/raw' ]
  },
  subscription: {
    sender_id: findOne('senders', config),
    active: config.nmosVersion === 'v10' ? undefined : true
  },
  version: versionTS(),
  label: 'RTPRx',
  id: uuidv4(),
  transport: 'urn:x-nmos:transport:rtp',
  interface_bindings: config.nmosVersion === 'v10' ? undefined : [
    'eth0',
    'eth1'
  ],
  device_id: findOne('devices', config)
});

module.exports = {
  selfMaker,
  deviceMaker,
  sourceMaker,
  flowMaker,
  senderMaker,
  receiverMaker
};
