//角色对象
const R = {
    com: 1, //电脑
    hum: 2, //玩家
    empty: 0,   //空位

    //角色转换函数
    reverse: function (r) {
        return r == 1 ? 2 : 1;
    }
}