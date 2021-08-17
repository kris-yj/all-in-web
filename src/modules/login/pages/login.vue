<template>
  <div
    class="login-wrap"
    :style="{backgroundImage: `url('${backgroundImage}')`}">
    <login-logo :logo-url="productLogo"></login-logo>
    <div class="login-box-wrap">
      <meg-login
        :login-code-enabled="loginCodeEnabled"
        :login-code="loginCode"
        :is-pki="isPki"
        @refresh-login-code="getLoginCode"
        @login="login"
        ref="loginComponent">
      </meg-login>
    </div>
    <login-footer v-if="showProductRight === 'true'"></login-footer>
  </div>
</template>

<script>
// import _ from 'lodash';
import { resetSystem } from '@/utils/startup.utils';
import LoginLogo from '../components/logo';
import loginFooter from '../components/login-footer';
import LoginSrv from '../login.service';

// const randomPicPath = require(`../../../assets/images/login/background-${_.random(0, 2)}.jpg`);
const IMAGE_API = '/api/galaxy/v1/system/extra/getImageWithoutAuth';

const loginErrorCode = {
  50001003: '账户被锁定',
  50001004: '用户名或密码错误'
};

export default {
  components: {
    LoginLogo,
    loginFooter
  },
  data() {
    return {
      loginCode: {
        id: '',
        codePicBase64: ''
      }
    };
  },
  computed: {
    backgroundImage() {
      // eslint-disable-next-line global-require
      return require('@/assets/images/login/background.png');
      // return randomPicPath;
    },
    showProductRight() {
      return this.$store.getters.systemByType('showProductRight').value;
    },
    productType() {
      return Number(this.$store.getters.systemByType('productType').value);
    },
    isPki() {
      const systemPkiLogin = this.$store.getters.systemByType('pkiLoginEnable');
      const { type } = this.$route.query;

      if (systemPkiLogin.value === '1') {
        if (type && type === 'account') {
          return false;
        }
        return true;
      }
      return false;
    },
    loginCodeEnabled() {
      const isEnabled = this.$store.getters.systemByType('loginCodeEnabled').value;
      return isEnabled === '1';
    },
    productLogo() {
      const logoCode = this.productType === 0 ? 'productLogo' : 'productLogo_DL';
      const logoPath = this.$store.getters.systemByType(logoCode).value;
      const isDefaultPath = logoPath && !logoPath.startsWith('/storage');
      return isDefaultPath ? logoPath : `${IMAGE_API}?url=${encodeURIComponent(logoPath)}`;
    },
  },
  created() {
    // 切换到login，只有两种情况，一种是退出，一种是手动输入login，匹配到loign路由，这两种都需要重新reset系统，包括清空之前的用户信息，和重置路由匹配
    consola.info('login created reset system');
    consola.info('login code enabled: ', this.$store.getters.systemByType('loginCodeEnabled').value);
    consola.info('login code enabled: ', this.loginCodeEnabled);
    if (this.loginCodeEnabled) {
      this.getLoginCode();
    }
    resetSystem();
    const productNameCode = this.productType === 0 ? 'productName' : 'productName_DL';
    const defaultSystemName = this.$store.getters.systemByType(productNameCode).value || '';
    document.title = defaultSystemName;
  },
  methods: {
    /**
     * 获取登录验证码
     */
    getLoginCode() {
      LoginSrv.getLoginCode().then((res) => {
        if (res.code === 0) {
          this.loginCode = res.data;
        }
      });
    },
    /**
     * 登录
     * params {用户名，密码}
     */
    login(params) {
      if (window.localStorage.getItem('animation')) window.localStorage.removeItem('animation');
      if (this.isPki) {
        console.log('pki login click');
        this.pkiLogin();
      } else {
        this.accountLogin(params);
      }
    },
    accountLogin(params) {
      // 传入系统的id
      params.clientAppId = clientAppId;
      LoginSrv.login(params).then((res) => {
        const { code, data } = res;
        if (code === 0) {
          consola.success('login success');
          window.localStorage.setItem('loginurl', window.location.href);
          // 存入token
          window.localStorage.setItem('token', data.token);
          // 导航到首页
          this.$router.push({ path: '/', replace: true });
        } else {
          const errorMsg = loginErrorCode[res.code] ? loginErrorCode[res.code] : res.msg;
          this.$refs.loginComponent.showLoginErrorMsg(errorMsg);
          // 登录报错后，重新刷新验证码
          if (this.loginCodeEnabled) {
            this.getLoginCode();
          }
        }
      });
    },
    pkiLogin() {
      // this.$router.push('/autologin');
      const pkiUrl = `https://${window.location.hostname}:10101/pki-login/pki/login`;
      window.location.href = pkiUrl;
    }
  }
};
</script>

<style lang="scss" scoped>
.login-wrap {
  display: flex;
  width: 100% !important;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
  align-items: center;

  .login-box-wrap {
    margin: 0 auto;
  }
}
</style>
