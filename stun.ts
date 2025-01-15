import type { ReceiveOptions, SendOptions } from './type';
import * as wrtc from 'wrtc';
// import isPortReachable from 'is-port-reachable';
import net from 'node:net';
import * as dgram from 'node:dgram';

export async function isPortReachableTcp(port, {host, timeout = 1500} = {}) {
  if (typeof host !== 'string') {
    throw new TypeError('Specify a `host`');
  }

  const promise = new Promise(((resolve, reject) => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      reject();
    };

    socket.setTimeout(timeout);

    socket.once('error', onError);
    socket.once('timeout', onError);
    let startTime = Date.now();
    socket.connect(port, host, () => {
      socket.end();
      resolve(Date.now() - startTime);
    });
  }));

  try {
    return await promise;
  } catch {
    return false;
  }
}
export async function isPortReachableUdp(port, {host, timeout = 1500} = {}) {
  if (typeof host !== 'string') {
    throw new TypeError('Specify a `host`');
  }
  let timeoutId;

  const promise = new Promise(((resolve, reject) => {
    const socket = dgram.createSocket('udp4'); // For IPv4, use 'udp6' for IPv6
    const onError = () => {
      reject();
    };

    socket.once('error', onError);
    socket.once('timeout', onError);
    let startTime = Date.now();
    socket.connect(port, host, () => {
      resolve(Date.now() - startTime);
    });
    timeoutId = setTimeout(() => {
      reject();
    }, timeout);
  }));
  promise.finally(() => {
    clearTimeout(timeoutId);
  });
  try {
    return await promise;
  } catch {
    return false;
  }
}

let stunServers: string[] = [

];

// avaialbe in CN with 1500 timeout
let stuntxt = `
stun.hitv.com:3478
stun.cloudflare.com:3478
stun.siplogin.de:3478
stun.miwifi.com:3478
stun.yy.com:3478
stun.qq.com:3478
stun.chat.bilibili.com:3478
stun.douyucdn.cn:18000
turn.cloud-rtc.com:80
stun-gl.ugreen.cloud:3478
stun.hot-chilli.net:3478
stunserver2024.stunprotocol.org:3478
stun.l.google.com:19302
stun.qq.com:3478
stun.cdnbye.com:3478
stun.nextcloud.com:3478
stun.nextcloud.com:443
stun.annatel.net:3478
stun.antisip.com:3478
stun.avigora.fr:3478
stun.cope.es:3478
stun.dcalling.de:3478
stun.freeswitch.org:3478
stun.ipfire.org:3478
stun.sip.us:3478
stun.sipnet.net:3478
stun.sipnet.ru:3478
stun.sma.de:3478
stun.sonetel.com:3478
stun.sonetel.net:3478
stun.symform.com:3478
stun.voip.blackberry.com:3478
stun.flashdance.cx:3478
`;

// https://gist.githubusercontent.com/mondain/b0ec1cf5f60ae726202e/raw/2d2b96b4508a38d342e0228d46eab84dad2398a3/public-stun-list.txt
// let stuntxt2 = `stun.hitv.com:3478
// stun.miwifi.com:3478
// stun.syncthing.net:3478
// stun.callwithus.com:3478
// stun.counterpath.com:3478
// stun.counterpath.net:3478
// stun.ekiga.net:3478
// stun.internetcalls.com:3478
// stun.schlund.de:3478
// stun.sipgate.net:10000
// stun.sipgate.net:3478
// stun.voip.aebc.com:3478
// stun.voiparound.com:3478
// stun.voipbuster.com:3478
// stun.voipstunt.com:3478
// stun.xten.com:3478
// stun.l.google.com:19302
// stun.l.google.com:19305
// stun4.l.google.com:19302
// stun4.l.google.com:19305
// stun.nextcloud.com:3478
// stun.nextcloud.com:443
// stun.myvoipapp.com:3478
// 23.21.150.121:3478
// stun.12connect.com:3478
// stun.12voip.com:3478
// stun.1und1.de:3478
// stun.2talk.co.nz:3478
// stun.3cx.com:3478
// stun.aa.net.uk:3478
// stun.acrobits.cz:3478
// stun.actionvoip.com:3478
// stun.advfn.com:3478
// stun.aeta-audio.com:3478
// stun.aeta.com:3478
// stun.annatel.net:3478
// stun.antisip.com:3478
// stun.avigora.fr:3478
// stun.awt.be:3478
// stun.b2b2c.ca:3478
// stun.bahnhof.net:3478
// stun.barracuda.com:3478
// stun.bluesip.net:3478
// stun.bmwgs.cz:3478
// stun.budgetsip.com:3478
// stun.cablenet-as.net:3478
// stun.callromania.ro:3478
// stun.chathelp.ru:3478
// stun.cheapvoip.com:3478
// stun.ciktel.com:3478
// stun.cloopen.com:3478
// stun.comfi.com:3478
// stun.commpeak.com:3478
// stun.comtube.com:3478
// stun.comtube.ru:3478
// stun.cope.es:3478
// stun.dcalling.de:3478
// stun.develz.org:3478
// stun.doublerobotics.com:3478
// stun.dus.net:3478
// stun.easybell.de:3478
// stun.easycall.pl:3478
// stun.easyvoip.com:3478
// stun.epygi.com:3478
// stun.etoilediese.fr:3478
// stun.faktortel.com.au:3478
// stun.freecall.com:3478
// stun.freeswitch.org:3478
// stun.freevoipdeal.com:3478
// stun.gmx.de:3478
// stun.gmx.net:3478
// stun.halonet.pl:3478
// stun.hoiio.com:3478
// stun.infra.net:3478
// stun.intervoip.com:3478
// stun.ipcomms.net:3478
// stun.ipfire.org:3478
// stun.ippi.fr:3478
// stun.ipshka.com:3478
// stun.it1.hr:3478
// stun.ivao.aero:3478
// stun.jumblo.com:3478
// stun.justvoip.com:3478
// stun.kanet.ru:3478
// stun.kiwilink.co.nz:3478
// stun.linea7.net:3478
// stun.linphone.org:3478
// stun.liveo.fr:3478
// stun.lowratevoip.com:3478
// stun.lugosoft.com:3478
// stun.lundimatin.fr:3478
// stun.magnet.ie:3478
// stun.mgn.ru:3478
// stun.mit.de:3478
// stun.mitake.com.tw:3478
// stun.myvoiptraffic.com:3478
// stun.mywatson.it:3478
// stun.nas.net:3478
// stun.neotel.co.za:3478
// stun.netappel.com:3478
// stun.netgsm.com.tr:3478
// stun.nfon.net:3478
// stun.noblogs.org:3478
// stun.noc.ams-ix.net:3478
// stun.nonoh.net:3478
// stun.nova.is:3478
// stun.on.net.mk:3478
// stun.ooma.com:3478
// stun.oriontelekom.rs:3478
// stun.ozekiphone.com:3478
// stun.pjsip.org:3478
// stun.poivy.com:3478
// stun.powerpbx.org:3478
// stun.powervoip.com:3478
// stun.ppdi.com:3478
// stun.qq.com:3478
// stun.rackco.com:3478
// stun.rapidnet.de:3478
// stun.rb-net.com:3478
// stun.rixtelecom.se:3478
// stun.rockenstein.de:3478
// stun.rolmail.net:3478
// stun.rynga.com:3478
// stun.sigmavoip.com:3478
// stun.sip.us:3478
// stun.sipdiscount.com:3478
// stun.siplogin.de:3478
// stun.sipnet.net:3478
// stun.sipnet.ru:3478
// stun.siportal.it:3478
// stun.siptraffic.com:3478
// stun.skylink.ru:3478
// stun.sma.de:3478
// stun.smartvoip.com:3478
// stun.smsdiscount.com:3478
// stun.solcon.nl:3478
// stun.solnet.ch:3478
// stun.sonetel.com:3478
// stun.sonetel.net:3478
// stun.sovtest.ru:3478
// stun.speedy.com.ar:3478
// stun.spokn.com:3478
// stun.srce.hr:3478
// stun.ssl7.net:3478
// stun.symform.com:3478
// stun.symplicity.com:3478
// stun.t-online.de:3478
// stun.tagan.ru:3478
// stun.teachercreated.com:3478
// stun.tel.lu:3478
// stun.telbo.com:3478
// stun.tis-dialog.ru:3478
// stun.tng.de:3478
// stun.twt.it:3478
// stun.u-blox.com:3478
// stun.ucallweconn.net:3478
// stun.ucsb.edu:3478
// stun.uls.co.za:3478
// stun.unseen.is:3478
// stun.usfamily.net:3478
// stun.veoh.com:3478
// stun.vipgroup.net:3478
// stun.vivox.com:3478
// stun.vline.com:3478
// stun.vo.lu:3478
// stun.vodafone.ro:3478
// stun.voicetrading.com:3478
// stun.voip.blackberry.com:3478
// stun.voip.eutelia.it:3478
// stun.voipblast.com:3478
// stun.voipbusterpro.com:3478
// stun.voipcheap.co.uk:3478
// stun.voipcheap.com:3478
// stun.voipfibre.com:3478
// stun.voipgain.com:3478
// stun.voipgate.com:3478
// stun.voipinfocenter.com:3478
// stun.voipplanet.nl:3478
// stun.voippro.com:3478
// stun.voipraider.com:3478
// stun.voipwise.com:3478
// stun.voipzoom.com:3478
// stun.vopium.com:3478
// stun.voxgratia.org:3478
// stun.voys.nl:3478
// stun.voztele.com:3478
// stun.webcalldirect.com:3478
// stun.wifirst.net:3478
// stun.wwdl.net:3478
// stun.xtratelecom.es:3478
// stun.zadarma.com:3478
// stun.zoiper.com:3478
// stun1.faktortel.com.au:3478
// stun1.l.google.com:19302
// stun2.l.google.com:19302
// stun3.l.google.com:19302
// stunserver.org:3478
// 124.64.206.224:8800
// stun.flashdance.cx:3478
// `;
// https://github.com/syncthing/syncthing/blob/main/lib/config/config.go

stunServers.push(...stuntxt.split('\n').map((line) => line.trim()).filter((line) => line.length > 0));

stunServers.forEach((server) => {
  if (!server.startsWith('stun:')) {
    server = 'stun:' + server;
  }
});

// dedup stunServers
stunServers = [...new Set(stunServers)];
export {stunServers};

export const pageDescription = 'A client-side secure P2P file sharing using WebRTC.';

export const githubLink = 'https://github.com/ntsd/zero-share';

export const defaultSendOptions: SendOptions = {
  chunkSize: 16 * 1024,
  isEncrypt: false,
  iceServer: stunServers[0]
};

export const defaultReceiveOptions: ReceiveOptions = {
  autoAccept: true,
  maxSize: 1024 * 1024 * 1024 // 1GB
};

export const waitIceCandidatesTimeout = 3000; // 3 seconds

// ping all to test the availability of stun servers
// for (const server of stunServers) {
//   const [host, port] = server.split(':');
//   console.log(server);
//   console.log(await isPortReachableUdp(parseInt(port), {host: host}));
// }


// const reachabilityChecks = stunServers.map(async (server:string) => {
//   const [host, port] = server.replace(/^/, '').split(':');
//   return { server, reachable: await isPortReachableTcp(parseInt(port), { host, timeout: 3500 }) };
// });

// const results = await Promise.all(reachabilityChecks);
// results.forEach(({ server, reachable }) => {
//   console.log(server, reachable);
// });

