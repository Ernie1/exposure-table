pragma solidity ^ 0.5.0;
pragma experimental ABIEncoderV2;

//曝光台
contract ET {

    //用户结构
    struct User {
        address addr;
        string name;
        bool supervisee;
        uint time;
    }

    //所有用户集合
    User[] private userList;

    //曝光结构
    struct Exposure {
        uint index;
        address superviser;
        address supervisee;
        string detail;
        uint detailTime;
        string reply;
        uint replyTime;
    }

    //所有曝光集合
    Exposure[] private exposureList;

    //判断用户地址是否存在
    function useraddrExist(address addr) public view returns(bool) {
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].addr == addr)
                return true;
        }
        return false;
    }

    //判断用户名是否存在
    function usernameExist(string memory name) public view returns(bool) {
        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(bytes(userList[i].name)) == keccak256(bytes(name)))
                return true;
        }
        return false;
    }

    //判断用户是否被监督者  
    function superviseeByAddr(address addr) private view returns(bool) {
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].addr == addr)
                return userList[i].supervisee;
        }
    }

    //根据用户名查找对应地址
    function useraddrByName(string memory name) private view returns(address) {
        require(usernameExist(name), '用户名不存在');
        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(bytes(userList[i].name)) == keccak256(bytes(name)))
                return userList[i].addr;
        }
    }

    //根据对应地址查找用户名
    function usernameByAddr(address addr) private view returns(string memory) {
        require(useraddrExist(addr), '用户名不存在');
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].addr == addr)
                return userList[i].name;
        }
    }

    //申请用户事件只公开被监督者
    event userRegisterEvent(string name, uint time);

    //申请用户
    function userRegister(string memory name, bool supervisee) public returns(bool) {
        require(!useraddrExist(msg.sender), '用户地址已存在');
        require(!usernameExist(name), '用户名已存在');
        uint nowtime = now;
        userList.push(User(msg.sender, name, supervisee, nowtime));
        if (supervisee) {
            emit userRegisterEvent(name, nowtime);
        } else {
            emit userRegisterEvent('', 0);
        }
        return true;
    }

    //获取用户个人信息
    function userInfo() public view returns(string memory, uint, bool) {
        require(useraddrExist(msg.sender), '用户地址不存在');
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].addr == msg.sender)
                return (
                    userList[i].name,
                    userList[i].time,
                    userList[i].supervisee
                );
        }
    }

    //获取用户名相关曝光序号
    function exposureIndexesByName(string memory username) public view returns(uint[] memory, uint) {
        uint[] memory indexes = new uint[](exposureList.length);
        uint count = 0;
        address useraddr = useraddrByName(username);
        for (uint i = 0; i < exposureList.length; i++) {
            if (exposureList[i].superviser == useraddr || exposureList[i].supervisee == useraddr) {
                indexes[count++] = i;
            }
        }
        return (
            indexes,
            count
        );
    }

    //获取所有被监督者序号
    function superviseeIndexes() public view returns(uint[] memory, uint) {
        uint[] memory indexes = new uint[](userList.length);
        uint count = 0;
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].supervisee) {
                indexes[count++] = i;
            }
        }
        return (
            indexes,
            count
        );
    }

    //查询被监督者
    function superviseeByIndex(uint i) public view returns(string memory, uint) {
        require(userList[i].supervisee, '非监督者');
        return (
            userList[i].name,
            userList[i].time
        );
    }

    //曝光数
    function exposureAmount() public view returns(uint) {
        return exposureList.length;
    }

    //查询曝光
    function exposureByIndex(uint i) public view returns(string memory, string memory, string memory, uint, string memory, uint) {
        return (
            usernameByAddr(exposureList[i].superviser),
            usernameByAddr(exposureList[i].supervisee),
            exposureList[i].detail, exposureList[i].detailTime,
            exposureList[i].reply, exposureList[i].replyTime
        );
    }

    //创建曝光事件
    event createExposureEvent(uint index, string superviserName, string superviseeName, string detail, uint time);

    //创建曝光
    function createExposure(string memory superviseeName, string memory detail) public returns(bool) {
        require(useraddrExist(msg.sender), '监督者不存在');
        require(!superviseeByAddr(msg.sender), '非监督者');
        require(usernameExist(superviseeName), '被监督者不存在');
        address superviseeAddr = useraddrByName(superviseeName);
        require(superviseeByAddr(superviseeAddr), '非被监督者');
        uint nowtime = now;
        exposureList.push(Exposure(exposureList.length, msg.sender, superviseeAddr, detail, nowtime, '', 0));
        emit createExposureEvent(exposureList.length - 1, usernameByAddr(msg.sender), superviseeName, detail, nowtime);
        return true;
    }

    //回复曝光事件
    event replyExposureEvent(uint index, string reply, uint time);

    //回复曝光
    function replyExposure(uint index, string memory reply) public returns(bool) {
        require(exposureList[index].supervisee == msg.sender, '非被监督者');
        require(exposureList[index].replyTime == 0, '已回复');
        exposureList[index].reply = reply;
        uint nowtime = now;
        exposureList[index].replyTime = nowtime;
        emit replyExposureEvent(index, reply, nowtime);
        return true;
    }
}