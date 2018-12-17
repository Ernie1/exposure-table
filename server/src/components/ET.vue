<template>
  <div>
    <el-container v-if="tableVisible">
      <el-header>
        <span>曝光台</span>
        <span>{{ name+'（监督'+(supervisee?'对象':'者')+'）' }}</span>
      </el-header>
      <el-container>
        <el-aside>
          <el-table :data="superviseeList" v-loading="superviseeLoading">
            <el-table-column prop="name" label="监督对象">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="注册时间">
              <template slot-scope="scope">
                <span>{{ scope.row.time | formatTime }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-aside>
        <el-main>
          <el-table :data="exposureList" v-loading="exposureLoading">
            <el-table-column prop="superviserName" label="监督者">
              <template slot-scope="scope">
                <span>{{ scope.row.superviserName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="superviseeName" label="监督对象">
              <template slot-scope="scope">
                <span>{{ scope.row.superviseeName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="曝光内容">
              <template slot-scope="scope">
                <span>{{ scope.row.detail }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="detailTime" label="曝光时间">
              <template slot-scope="scope">
                <span>{{ scope.row.detailTime | formatTime }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reply" label="回复内容">
              <template slot-scope="scope">
                <span>{{ scope.row.reply }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="replyTime" label="回复时间">
              <template slot-scope="scope">
                <span>{{ scope.row.replyTime | formatTime }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog
      :title="mode"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :center="false"
      :modal="false"
    >
      <el-input v-if="mode=='新建节点账户'" v-model="dialogInput" type="password" placeholder="请设置密码"></el-input>

      <el-input v-if="mode=='注册合约用户'" v-model="dialogInput" placeholder="请设置用户名">
        <el-checkbox slot="append" v-model="dialogChecked">被监督</el-checkbox>
      </el-input>

      <span slot="footer">
        <el-button
          v-if="mode=='新建节点账户'"
          type="primary"
          :loading="confirmButtonLoading"
          @click="newAccount"
        >确 定</el-button>
        <el-button
          v-if="mode=='注册合约用户'"
          type="primary"
          :loading="confirmButtonLoading"
          @click="userRegister"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Web3 from "web3";
import web3Admin from "web3admin";
import { contractInterface, contractAddress } from "../../config";
import { formatTime } from "../../build/my-utils";
// import { resolve } from "url";
// import { rejects } from "assert";
// import { constants } from 'http2';
export default {
  name: "ET",
  created: async function() {
    // 连接 rpc
    await this.connect();
    // 节点账户
    if (this.web3.eth.accounts.length == 0) {
      this.mode = "新建节点账户";
      this.dialogVisible = true;
    } else {
      this.contract();
    }
    // // 合约
    // this.etInstance = this.web3.eth
    //   .contract(contractInterface)
    //   .at(contractAddress);
    // // 合约用户
    // if (!this.etInstance.useraddrExist(this.web3.eth.accounts[0])) {
    //   this.dialogVisible = true;
    // } else {
    //   this.maintainSuperviseeList();
    //   this.maintainExposureList();
    // }
  },

  data() {
    return {
      dialogVisible: false,
      dialogChecked: false,
      tableVisible: false,
      dialogInput: "",
      confirmButtonLoading: false,
      superviseeLoading: false,
      exposureLoading: false,
      superviseeList: [],
      exposureList: [],
      mode: "",
      name: "",
      supervisee: false
    };
  },
  filters: {
    formatTime
  },
  methods: {
    connect: async function() {
      return new Promise((resolve, _) => {
        this.$prompt("请输入 rpcport", "连接", {
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          modal: false,
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

    newAccount() {
      var that = this;
      this.confirmButtonLoading = true;
      this.web3.personal.newAccount(this.dialogInput, (err, _) => {
        if (!err) {
          that.confirmButtonLoading = false;
          that.$message({
            type: "success",
            message: "新建节点账户成功"
          });
          that.dialogVisible = false;
          that.contract();
        } else {
          that.confirmButtonLoading = false;
          that.$message.error("新建节点账户失败");
        }
      });
    },

    contract() {
      var that = this;
      this.etInstance = this.web3.eth
        .contract(contractInterface)
        .at(contractAddress);
      // 合约用户
      if (!this.etInstance.useraddrExist(this.web3.eth.accounts[0])) {
        this.mode = "注册合约用户";
        this.dialogVisible = true;
      } else {
        that.tableVisible = true;
        that.userInfo();
        that.maintainSuperviseeList();
        that.maintainExposureList();
      }
    },

    userInfo() {
      var user = this.etInstance.userInfo();
      this.name = user[0];
      this.supervisee = user[2];
    },

    maintainSuperviseeList() {
      // fetch
      var that = this;
      this.superviseeLoading = true;
      var superviseeIndexes = this.etInstance.superviseeIndexes();
      superviseeIndexes[0].every((value, index) => {
        if (index == superviseeIndexes[1].c[0]) {
          return false;
        }
        var supervisee = that.etInstance.superviseeByIndex(value.c[0]);
        that.superviseeList.unshift({
          name: supervisee[0],
          time: supervisee[1].c[0]
        });
        return true;
      });
      this.superviseeLoading = false;
      // watching
      this.etInstance.userRegisterEvent().watch(function(err, result) {
        if (!err) {
          if (result.args.time.c[0] != 0) {
            that.superviseeLoading = true;
            that.superviseeList.unshift({
              name: result.args.name,
              time: result.args.time.c[0]
            });
            that.superviseeLoading = false;
          }
        }
      });
    },

    maintainExposureList() {
      // fetch
      var that = this;
      this.exposureLoading = true;
      var exposureAmount = this.etInstance.exposureAmount().c[0];
      for (var i = 0; i < exposureAmount; i++) {
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
      this.exposureLoading = false;
      // watching
      this.etInstance.createExposureEvent().watch(function(err, result) {
        if (!err) {
          that.exposureLoading = true;
          that.exposureList.unshift({
            index: result.args.index.c[0],
            superviserName: result.args.superviserName,
            superviseeName: result.args.superviseeName,
            detail: result.args.detail,
            detailTime: result.args.time.c[0],
            reply: "",
            replyTime: 0
          });
          that.exposureLoading = false;
        }
      });
      this.etInstance.replyExposureEvent().watch(function(err, result) {
        if (!err) {
          that.exposureLoading = true;
          for (var i = 0; i < that.exposureList.length; i++) {
            if (that.exposureList[i].index == result.args.index.c[0]) {
              that.exposureList[i].reply = result.args.reply;
              that.exposureList[i].replyTime = result.args.time;
              break;
            }
          }
          that.exposureLoading = false;
        }
      });
    },

    unlockAccount: async function() {
      var that = this;
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
                  that.$message.error("密码错误");
                  instance.confirmButtonLoading = false;
                } else {
                  that.$message({
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
      var that = this;
      return new Promise((resolve, _) => {
        var event = this.etInstance[eventName]();
        event.watch(function(err, result) {
          if (!err && result.transactionHash == transactionHash) {
            that.web3.miner.stop();
            that.$message({
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

    userRegister() {
      var that = this;
      this.confirmButtonLoading = true;
      if (this.etInstance.usernameExist(this.dialogInput)) {
        this.$message.error("用户名已存在");
        this.confirmButtonLoading = false;
      } else {
        this.etInstance.userRegister(
          this.dialogInput,
          this.dialogChecked,
          {
            from: this.web3.eth.accounts[0],
            gas: 4700000
          },
          async function(err, transactionHash) {
            if (err) {
              await that.unlockAccount();
              that.confirmButtonLoading = false;
            } else {
              await that.mining("userRegisterEvent", transactionHash);
              that.$message({
                type: "success",
                message: "注册成功"
              });
              that.confirmButtonLoading = false;
              that.dialogVisible = false;
              that.tableVisible = true;
              that.userInfo();
              that.maintainSuperviseeList();
              that.maintainExposureList();
            }
          }
        );
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-main {
  padding-top: 0px;
  padding-bottom: 0px;
}

.el-aside {
  padding-left: 20px;
}

.el-header {
  line-height: 60px;
  display: flex;
  justify-content: space-between;
}

/* .el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
} */
</style>