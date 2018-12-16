<template>
  <!--  -->
  <!-- <el-button v-if="web3." type="primary" @click.stop="register()">登录</el-button> -->
  <div>
    <!-- <h1>{{ msg }}</h1> -->
    <el-dialog
      title="注册合约用户"
      :visible.sync="registerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :center="false"
    >
      <div class="dialog-content">
        <el-row>
          <el-input v-model="registerInput" placeholder="请设置用户名">
            <el-checkbox slot="append" v-model="registerSupervisee">被监督</el-checkbox>
          </el-input>
        </el-row>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="confirmButtonLoading" @click="userRegister">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Web3 from "web3";
import web3Admin from "web3admin";
import { contractInterface, contractAddress } from "../../config";
import { formatTime } from "../../build/my-utils"
import { resolve } from "url";
import { rejects } from "assert";
export default {
  name: "HelloWorld",
  created: async function() {
    // 连接 rpc
    await this.connect();
    // 节点账户
    if (this.web3.eth.accounts.length == 0) {
      await this.newAccount();
    }
    // 合约
    this.etInstance = this.web3.eth
      .contract(contractInterface)
      .at(contractAddress);
    // 合约用户
    if (!this.etInstance.useraddrExist(this.web3.eth.accounts[0])) {
      this.registerVisible = true;
    } else {
      this.maintainSuperviseeList();
      this.maintainExposureList();
    }
  },

  data() {
    return {
      registerVisible: false,
      registerSupervisee: false,
      registerInput: "",
      confirmButtonLoading: false,
      superviseeList: [],
      exposureList: []
    };
  },

  methods: {
    connect: async function() {
      return new Promise((resolve, _) => {
        this.$prompt("请输入 rpcport", "连接", {
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          beforeClose: (_, instance, done) => {
            instance.confirmButtonLoading = true;
            this.web3 = new Web3(
              new Web3.providers.HttpProvider(
                "http://127.0.0.1:" + instance.inputValue
              )
            );
            if (this.web3.isConnected()) {
              web3Admin.extend(this.web3);
              this.$message({
                type: "success",
                message: "连接成功"
              });
              instance.confirmButtonLoading = false;
              done();
            } else {
              this.$message.error("连接失败");
              instance.confirmButtonLoading = false;
            }
          }
        }).then(() => {
          resolve();
        });
      });
    },

    newAccount: async function() {
      return new Promise((resolve, _) => {
        this.$prompt("请设置密码", "新建节点账户", {
          inputType: "password",
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          beforeClose: (_, instance, done) => {
            instance.confirmButtonLoading = true;
            this.web3.personal.newAccount(instance.inputValue, (err, res) => {
              if (!err) {
                instance.confirmButtonLoading = false;
                done();
              }
            });
          }
        }).then(() => {
          this.$message({
            type: "success",
            message: "新建节点账户成功"
          });
          resolve();
        });
      });
    },

    maintainSuperviseeList() {
      // fetch
      var superviseeIndexes = this.etInstance.superviseeIndexes();
      superviseeIndexes[0].every((value, index) => {
        if (index == superviseeIndexes[1].c[0]) {
          return false;
        }
        var supervisee = this.etInstance.superviseeByIndex(value.c[0]);
        this.superviseeList.unshift({
          name: supervisee[0],
          time: supervisee[1].c[0]
        });
        return true;
      });
      // watching
      this.etInstance.userRegisterEvent().watch(function (err, result) {
        if (!err) {
          this.superviseeList.unshift({
            name: result.args.name,
            time: result.args.time.c[0]
          });
        }
      });
    },

    maintainExposureList(){
      // fetch
      var exposureAmount = this.etInstance.exposureAmount().c[0];
      for (i = 0; i < exposureAmount; i++) {
        var exposure = this.etInstance.exposureByIndex(i);
        this.exposureList.unshift({
          index: i,
          superviserName: exposure[0],
          superviseeName: exposure[1],
          detail: exposure[2],
          detailTime: exposure[3].c[0],
          reply: exposure[4],
          replyTime: exposure[5].c[0]
        });
      }
      // watching
      this.etInstance.createExposureEvent().watch(function (err, result) {
        if (!err) {
          this.exposureList.unshift({
            index: result.args.index.c[0],
            superviserName: result.args.superviserName,
            superviseeName: result.args.superviseeName,
            detail: result.args.detail,
            detailTime: result.args.time.c[0],
            reply: '',
            replyTime: 0
          });
        }
      });
      this.etInstance.replyExposureEvent().watch(function (err, result) {
        if (!err) {
          for (i = 0; i < this.exposureList.length; i++) {
            if (this.exposureList[i].index == result.args.index.c[0]) {
              this.exposureList[i].reply = result.args.reply;
              this.exposureList[i].replyTime = result.args.time;
              break;
            }
          }
        }
      });
    },

    unlockAccount: async function() {
      return new Promise((resolve, _) => {
        this.$prompt("请输入密码", "解锁节点账户", {
          inputType: "password",
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          beforeClose: (_, instance, done) => {
            instance.confirmButtonLoading = true;
            this.web3.personal.unlockAccount(
              this.web3.eth.accounts[0],
              instance.inputValue,
              function(err, _) {
                if (err) {
                  this.$message.error("密码错误");
                  instance.confirmButtonLoading = false;
                } else {
                  this.$message({
                    type: "success",
                    message: "解锁成功"
                  });
                  instance.confirmButtonLoading = false;
                  done();
                }
              }
            );
          }
        }).then(() => {
          resolve();
        });
      });
    },

    mining: async function(eventName, transactionHash) {
      return new Promise((resolve, _) => {
        var event = this.etInstance[eventName]();
        event.watch(function (err, result) {
          if (!err && result.transactionHash == transactionHash) {
            this.web3.miner.stop();
            this.$message({
              type: "success",
              message: "挖矿完成"
            });
            event.stopWatching();
            resolve();
          }
        });
        this.web3.miner.start();
        this.$message("开始挖矿");
      });
    },

    userRegister: async function() {
      this.confirmButtonLoading = true;
      if (this.etInstance.usernameExist(this.registerInput)) {
        this.$message.error("用户名已存在");
        this.confirmButtonLoading = false;
      } else {
        var again = true;
        while(again){
          this.etInstance.userRegister(
            this.registerInput,
            this.registerSupervisee,
            {
              from: this.web3.eth.accounts[0],
              gas: 4700000
            },
            async function(err, transactionHash) {
              if (err) {
                console.log('1');
                console.log(err);
                await this.unlockAccount();
              } else {
                await this.mining("userRegisterEvent", transactionHash);
                this.$message({
                  type: "success",
                  message: "注册成功"
                });
                this.confirmButtonLoading = false;
                this.registerVisible = false;
                this.maintainSuperviseeList();
                this.maintainExposureList();
                again = false;
              }
            }
          );
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>