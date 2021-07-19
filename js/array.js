//array对象，目前只包含制造二维数组方法
let array = {
    create: function (row_num, col_num) {
        let ret = []
        //循环制造二维数组
        for (let i = 0; i < row_num; ++i) {
            let row = []
            for (let j = 0; j < col_num; ++j) {
                row.push(0)
            }
            ret.push(row)
        }
        return ret
    }
}