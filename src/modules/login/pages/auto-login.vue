<template>
  <div>
  </div>
</template>
<script>
import LoginSrv from '../login.service';

export default {
  created() {
    console.log('pki auto login');
    this.autoLogin();
  },
  methods: {
    autoLogin() {
      const cookie = document.cookie.split(';');
      console.info(cookie);
      const urlParms = this.$route.query;

      // pki登录
      LoginSrv.pkiLogin({
        'userName': urlParms.key,
        'clientAppId': clientAppId
      }).then((res) => {
        if (res.code === 0) {
          window.localStorage.setItem('loginurl', window.location.href);
          // 存入token
          window.localStorage.setItem('token', res.data.token);
          // 导航到首页
          this.$router.push('/');
        } else {
          sessionStorage.setItem('errorInfo', res.msg);
          sessionStorage.setItem('cookieInfo', cookie);
          // window.sessionStorage.setItem('url', window.config.globalConfig.apiPath.service);
          // window.location.href = './static/loginError.html';
        }
      });
    }
  },
};
</script>
<style scope>

</style>
