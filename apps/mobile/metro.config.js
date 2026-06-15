const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Dizemos ao empacotador nativo para ler e compilar o CSS global
module.exports = withNativeWind(config, { input: "./app/global.css" });
