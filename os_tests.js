const osutils = require('os-utils');

const res = [];

// console.log(`Platform: ${osutils.platform()}`);
// console.log(`Number of CPUs: ${osutils.cpuCount()}`);

const stats = () => {
    osutils.cpuUsage((v) => {
        // console.log(`CPU Usage (%) : ${v}`);
        const json = {
            'CPU Usage': v,
            'Load Average (5m)': osutils.loadavg(5),
            'Total Memory': osutils.totalmem(),
            'Free Memory': osutils.freemem(),
            'Free Memory (%)': osutils.freememPercentage(),
            'System Uptime': osutils.sysUptime(),
        };

        res.push(json);
    });
};

const sumUp = () => {
    const toReturn = {
        'CPU Usage': 0,
        'Load Average (5m)': 0,
        'Total Memory': 0,
        'Free Memory': 0,
        'Free Memory (%)': 0,
        'System Uptime': 0,
    };

    res.forEach((el) => {
        toReturn['CPU Usage'] += el['CPU Usage'];
        toReturn['Load Average (5m)'] += el['Load Average (5m)'];
        toReturn['Total Memory'] += el['Total Memory'];
        toReturn['Free Memory'] += el['Free Memory'];
        toReturn['Free Memory (%)'] += el['Free Memory (%)'];
        toReturn['System Uptime'] += el['System Uptime'];
    });

    toReturn['CPU Usage'] /= res.length;
    toReturn['Load Average (5m)'] /= res.length;
    toReturn['Total Memory'] /= res.length;
    toReturn['Free Memory'] /= res.length;
    toReturn['Free Memory (%)'] /= res.length;
    toReturn['System Uptime'] /= res.length;

    console.log(toReturn);
};
const handler = setInterval(stats, 100);


const timeInSec = 300;
setTimeout(() => {
    clearInterval(handler);
    sumUp();
    process.exit();
}, timeInSec * 1000);
