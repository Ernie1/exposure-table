<template>
  <div>
    <el-container v-if="tableVisible">
      <el-header>
        <el-tooltip :visible-arrow="false" effect="dark" :content="supervisee?'点击右侧曝光相应条目回复曝光':'点击左侧监督对象条目创建曝光'" placement="right">
          <span>曝光台</span>
        </el-tooltip>
        <span>{{ name+'（监督'+(supervisee?'对象':'者')+'）' }}</span>
      </el-header>
      <el-container>
        <el-aside width="180px">
          <el-table
            :data="superviseeList"
            v-loading="superviseeLoading"
            @row-click="createExposure"
            v-if="tableAlive"
          >
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
          <el-table
            :data="exposureList"
            v-loading="exposureLoading"
            @row-click="replyExposure"
            v-if="tableAlive"
          >
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
      :close-on-click-modal="mode=='创建曝光'||mode=='回复曝光'"
      :close-on-press-escape="mode=='创建曝光'||mode=='回复曝光'"
      :show-close="mode=='创建曝光'||mode=='回复曝光'"
      :center="false"
      :modal="mode=='创建曝光'||mode=='回复曝光'"
    >
      <el-input v-if="mode=='新建节点账户'" v-model="dialogInput" type="password" placeholder="请设置密码"></el-input>

      <el-input v-if="mode=='注册合约用户'" v-model="dialogInput" placeholder="请设置用户名">
        <el-checkbox slot="append" v-model="dialogChecked">被监督</el-checkbox>
      </el-input>

      <el-input
        v-if="mode=='创建曝光'"
        v-model="dialogInput"
        :placeholder="'请输入曝光 '+createExposureSupervisee+' 的内容'"
      ></el-input>

      <el-input
        v-if="mode=='回复曝光'"
        v-model="dialogInput"
        :placeholder="'请输入回复“'+replyExposureDetail+'”的内容'"
      ></el-input>

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
        <el-button
          v-if="mode=='创建曝光'"
          type="primary"
          :loading="confirmButtonLoading"
          @click="createExposureConfirm"
        >确 定</el-button>
        <el-button
          v-if="mode=='回复曝光'"
          type="primary"
          :loading="confirmButtonLoading"
          @click="replyExposureConfirm"
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

export default {
  name: "ET",
  created: async function() {
    // 连接 rpc
    await this.connect();
    // 节点账户
    if (this.web3.eth.accounts.length == 0) {
      this.mode = "新建节点账户";
      this.dialogVisible = true;
      this.dialogInput = "";
    } else {
      this.contract();
    }
    // 每分钟更新表格时间显示
    setInterval(() => {
      this.tableAlive = false;
      this.$nextTick(() => (this.tableAlive = true));
    }, 60000);
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
      tableAlive: true,
      superviseeList: [],
      exposureList: [],
      mode: "",
      name: "",
      supervisee: false,
      createExposureSupervisee: "",
      replyExposureDetail: ""
    };
  },
  filters: {
    formatTime
  },
  methods: {
    connect: async function() {
      return new Promise((resolve, _) => {
        this.$prompt("", "连接", {
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          modal: false,
          inputPlaceholder: "请输入 rpc 端口号",
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
        this.dialogInput = "";
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
            if (
              !that.superviseeList.find(item => item.name == result.args.name)
            ) {
              that.superviseeList.unshift({
                name: result.args.name,
                time: result.args.time.c[0]
              });
            }
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
          if (
            !that.exposureList.find(
              item => item.index == result.args.index.c[0]
            )
          ) {
            that.exposureList.unshift({
              index: result.args.index.c[0],
              superviserName: result.args.superviserName,
              superviseeName: result.args.superviseeName,
              detail: result.args.detail,
              detailTime: result.args.time.c[0],
              reply: "",
              replyTime: 0
            });
            if (that.supervisee && that.name == result.args.superviseeName) {
              that.$notify({
                title: result.args.superviserName,
                message: result.args.detail,
                duration: 0
              });
            }
          }
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
              if (
                !that.supervisee &&
                that.name == that.exposureList[i].superviserName
              ) {
                that.$notify({
                  title: that.exposureList[i].superviseeName,
                  message: result.args.reply,
                  duration: 0
                });
              }
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
    },

    createExposure(row) {
      if (!this.supervisee) {
        this.mode = "创建曝光";
        this.dialogVisible = true;
        this.dialogInput = "";
        this.createExposureSupervisee = row.name;
      }
    },

    createExposureConfirm() {
      var that = this;
      this.confirmButtonLoading = true;
      this.etInstance.createExposure(
        this.createExposureSupervisee,
        this.dialogInput,
        {
          from: this.web3.eth.accounts[0],
          gas: 4700000
        },
        async function(err, transactionHash) {
          if (err) {
            await that.unlockAccount();
            that.confirmButtonLoading = false;
          } else {
            await that.mining("createExposureEvent", transactionHash);
            that.$message({
              type: "success",
              message: "创建成功"
            });
            that.confirmButtonLoading = false;
            that.dialogVisible = false;
          }
        }
      );
    },

    replyExposure(row) {
      if (
        this.supervisee &&
        row.superviseeName == this.name &&
        row.replyTime == 0
      ) {
        this.mode = "回复曝光";
        this.dialogVisible = true;
        this.dialogInput = "";
        this.replyExposureDetail = row.detail;
        this.replyExposureIndex = row.index;
      }
    },

    replyExposureConfirm() {
      var that = this;
      this.confirmButtonLoading = true;
      this.etInstance.replyExposure(
        this.replyExposureIndex,
        this.dialogInput,
        {
          from: this.web3.eth.accounts[0],
          gas: 4700000
        },
        async function(err, transactionHash) {
          if (err) {
            await that.unlockAccount();
            that.confirmButtonLoading = false;
          } else {
            await that.mining("replyExposureEvent", transactionHash);
            that.$message({
              type: "success",
              message: "回复成功"
            });
            that.confirmButtonLoading = false;
            that.dialogVisible = false;
          }
        }
      );
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
</style>