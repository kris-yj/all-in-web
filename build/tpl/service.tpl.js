const serviceTpl =
`/* Automatically generated by './build/add-module.js' */
// import MegHttp from 'megvii-http';
// import config from '@/utils/config.utils';

// path prefix
// const baseUrl = config.apiPath.service; // 基础地址
// const auth = config.apiPath.auth; // auth地址

// service path
// const urls = {};

// service methods
const {{camelModuleName}}Srv = {};

export default {{camelModuleName}}Srv;
`;

module.exports = serviceTpl;