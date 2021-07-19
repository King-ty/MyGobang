const BOARD_SIZE = 15   //棋盘大小
const PIECE_RADIUS = 13 //棋子半径
const COLOR_BOARD = '#FFAA00'
const COLOR_BOARD_LINE = '#000000'
const COLOR_STRESS = '#FF0000'

let canvas = document.getElementById("chessboard")  //初始化画布
let context = canvas.getContext("2d")   //画布绘制类型
let piece_black //true表示当前落子为黑色，false表示为白色
let nw_role //当前角色信息
let init_finished = false   //是否完成初始化，用于判断是否接受点击信息

cleanBoard()
drawBoardLines()

/**
 * 游戏开始函数，点击"电脑先行"或"玩家先行"进行相应参数的调用
 * @param com_first 判断是否是电脑先行
 */
function startGame(com_first) {
    board.init(BOARD_SIZE)  //棋盘(board)初始化
    cleanBoard()    //清除棋盘画布
    piece_black = true  //设定第一步为黑棋行棋
    drawBoardLines()    //绘制棋盘线

    //设置按钮的可见性
    document.getElementsByName("meFirst")[0].style.cssText = "display:none;"
    document.getElementsByName("computerFirst")[0].style.cssText = "display:none;"
    document.getElementsByName("restart")[0].style.cssText = "display:inline-block;"
    document.getElementsByName("goBack")[0].style.cssText = "display:inline-block;"

    init_finished = true    //完成初始化

    if (com_first) {
        nw_role = R.com
        //若电脑先行，第一步在(7,7)处下黑棋
        oneStep(7, 7)
    } else {
        nw_role = R.hum
    }
}

/**
 * 清空棋盘画布，将画布上的棋子及格线擦除
 */
function cleanBoard() {
    //设置按钮的可见性
    document.getElementsByName("meFirst")[0].style.cssText = "display:inline-block;"
    document.getElementsByName("computerFirst")[0].style.cssText = "display:inline-block;"
    document.getElementsByName("restart")[0].style.cssText = "display:none;"
    document.getElementsByName("goBack")[0].style.cssText = "display:none;"

    //填充背景
    context.fillStyle = COLOR_BOARD
    context.fillRect(0, 0, canvas.width, canvas.height)
    drawBoardLines() //画格线
}

/**
 * 画线函数封装
 * @param x_begin   起点x坐标
 * @param y_begin   起点y坐标
 * @param x_end     终点x坐标
 * @param y_end     终点y坐标
 * @param line_width    画线宽度
 * @param line_color    画线颜色
 */
function paintLine(x_begin, y_begin, x_end, y_end, line_width = 1, line_color) {
    context.lineWidth = line_width  //设置线宽度
    if (line_color === undefined) {
        line_color = context.strokeStyle
    }

    //先画白线，防止颜色重叠
    context.strokeStyle = "#FFFFFF"
    context.beginPath()
    context.moveTo(x_begin, y_begin)
    context.lineTo(x_end, y_end)
    context.closePath()
    context.stroke()

    //画线
    context.strokeStyle = line_color
    context.beginPath()
    context.moveTo(x_begin, y_begin)
    context.lineTo(x_end, y_end)
    context.closePath()
    context.stroke()
}

/**
 * 绘制棋盘线
 */
function drawBoardLines() {
    //循环绘制横线和竖线
    for (let i = 0; i < BOARD_SIZE; i++) {
        const nx = 15 + i * 30
        paintLine(nx, 15, nx, canvas.height - 15, 1, COLOR_BOARD_LINE)
        paintLine(15, nx, canvas.height - 15, nx, 1, COLOR_BOARD_LINE)
    }
}

/**
 * 绘制棋子
 * @param i     棋子在棋盘上x轴格数
 * @param j     棋子在棋盘上y轴格数
 */
function paintPiece(i, j, piece) {
    //计算棋子圆心在画布上坐标
    const nr = 15 + i * 30, nc = 15 + j * 30

    context.beginPath()
    context.arc(nr, nc, PIECE_RADIUS, 0, 2 * Math.PI)
    context.closePath()
    let gradient = context.createRadialGradient(nr + 2, nc - 2, PIECE_RADIUS, nr + 2, nc - 2, 0)    //设置渐变填充效果
    if (piece) {
        //绘制黑棋
        gradient.addColorStop(0, "#0A0A0A")
        gradient.addColorStop(1, "#636766")
    } else {
        //绘制白棋
        gradient.addColorStop(0, "#D1D1D1")
        gradient.addColorStop(1, "#F9F9F9")
    }
    context.fillStyle = gradient
    context.fill()
}

/**
 * 强调棋子(外层画圆)
 * @param i     棋子在棋盘上x轴格数
 * @param j     棋子在棋盘上y轴格数
 * @param unstress  是否为解除强调
 * @param black     棋子本身颜色是否为黑色
 */
function stressPiece(i, j, unstress, black) {
    //计算棋子圆心在画布上坐标
    const nr = 15 + i * 30, nc = 15 + j * 30

    if (!unstress) {    //解除强调参数
        context.lineWidth = 2
        context.strokeStyle = COLOR_STRESS
    } else {    //强调参数
        context.lineWidth = 3
        context.strokeStyle = COLOR_BOARD
    }
    context.beginPath()
    context.arc(nr, nc, PIECE_RADIUS + 1, 0, 2 * Math.PI)
    context.closePath()
    context.stroke()

    if (unstress) { //解除强调需要补黑线和棋子边框，否则显示效果不好
        paintLine(nr, nc - PIECE_RADIUS - 3, nr, nc - PIECE_RADIUS, 1, COLOR_BOARD_LINE)
        paintLine(nr, nc + PIECE_RADIUS + 3, nr, nc + PIECE_RADIUS, 1, COLOR_BOARD_LINE)
        paintLine(nr - PIECE_RADIUS - 3, nc, nr - PIECE_RADIUS, nc, 1, COLOR_BOARD_LINE)
        paintLine(nr + PIECE_RADIUS + 3, nc, nr + PIECE_RADIUS, nc, 1, COLOR_BOARD_LINE)

        context.lineWidth = 2
        if (black == true)  //棋子是黑色
            context.strokeStyle = "#0A0A0A"
        else
            context.strokeStyle = "#D1D1D1"
        context.beginPath()
        context.arc(nr, nc, PIECE_RADIUS - 1, 0, 2 * Math.PI)
        context.closePath()
        context.stroke()
    }
}

/**
 * 执行一步棋
 * @param i     棋子在棋盘上x轴格数
 * @param j     棋子在棋盘上y轴格数
 */
function oneStep(i, j) {
    paintPiece(i, j, piece_black)   //绘制棋子

    //解除上一步的强调
    if (board.all_steps.length >= 1) {
        let last_p = board.all_steps[board.all_steps.length - 1]
        stressPiece(last_p[0], last_p[1], true, !piece_black)
    }
    let p = [i, j]
    board.put(p, nw_role)
    stressPiece(i, j, false)    //强调

    //判断是否结束
    if (isOver(i, j)) {
        setTimeout(function () { alert(nw_role == R.hum ? "玩家获胜！" : "电脑获胜！") }, 10)   //设置延时，防止卡顿
        init_finished = false
        document.getElementsByName("goBack")[0].style.cssText = "display:none;"
    }

    //反转下一步棋子颜色和角色
    if (init_finished) {
        piece_black = !piece_black
        nw_role = R.reverse(nw_role)
    }
}

/**
 * 执行一步棋
 * @param r     棋子在棋盘上的行数
 * @param c     棋子在棋盘上列数
 */
function isOver(r, c) {
    //行列移动方式数组
    const mov_r = [0, 1, 1, 1]
    const mov_c = [1, 0, 1, -1]

    const role = board.board[r][c]  //当前角色

    //循环查找有无5子相连
    for (let i = 0; i < mov_r.length; i++) {
        let cnt = 1
        for (let j = 1; j <= 4; j++) {
            let nr = r + j * mov_r[i]
            let nc = c + j * mov_c[i]

            //遇到出界或非当前角色的格子即退出循环
            if (nr >= BOARD_SIZE || nr < 0 || nc >= BOARD_SIZE || nc < 0 || board.board[nr][nc] != role) {
                break
            }
            ++cnt
        }
        for (let j = 1; j <= 4; j++) {
            let nr = r - j * mov_r[i]
            let nc = c - j * mov_c[i]

            //遇到出界或非当前角色的格子即退出循环
            if (nr >= BOARD_SIZE || nr < 0 || nc >= BOARD_SIZE || nc < 0 || board.board[nr][nc] != role) {
                break
            }
            ++cnt
        }
        if (cnt >= 5) {
            return true
        }
    }
    return false
}

/**
 * 鼠标点击函数，进行下棋操作
 * @param e 鼠标点击事件
 */
canvas.onclick = function (e) {
    if (nw_role != R.hum || init_finished == false)
        return

    //获得点击坐标并计算格线上的坐标
    let x = e.offsetX
    let y = e.offsetY
    let i = Math.floor(x / 30)
    let j = Math.floor(y / 30)


    if (board.board[i][j] == R.empty) { // 如果该位置没有棋子，则允许落子
        //玩家落子
        oneStep(i, j)

        //设置延时，防止卡顿
        setTimeout(function () {
            if (init_finished) {
                //搜索电脑策略
                let p = searchMethod()
                console.log('得分为：' + p.score)   //输出得分用于调试
                //电脑落子
                oneStep(p[0], p[1])
            }
        }, 1)
    }
}

/**
 * 悔棋操作，填充空白
 * @param i
 * @param j
 */
function removePiece(i, j) {
    //计算棋子圆心在画布上坐标
    const nr = 15 + i * 30, nc = 15 + j * 30

    //填充背景色圆圈
    context.beginPath()
    context.arc(nr, nc, PIECE_RADIUS + 3, 0, 2 * Math.PI)
    context.closePath()
    let gradient = context.createRadialGradient(nr + 2, nc - 2, PIECE_RADIUS, nr + 2, nc - 2, 0)
    gradient.addColorStop(1, COLOR_BOARD)
    context.fillStyle = gradient
    context.fill()

    //补绘黑线
    paintLine(nr, nc - PIECE_RADIUS - 3, nr, nc + PIECE_RADIUS + 3, 1, COLOR_BOARD_LINE)
    paintLine(nr - PIECE_RADIUS - 3, nc, nr + PIECE_RADIUS + 3, nc, 1, COLOR_BOARD_LINE)
}


//悔棋
function goBack() {
    //若不能悔棋了(到达开始位置)，直接返回
    if (board.all_steps.length < 2)
        return
    //清楚画布棋子
    for (let i = 1; i <= 2; ++i) {
        p = board.all_steps[board.all_steps.length - i]
        removePiece(p[0], p[1])
    }
    //board退步操作
    board.backward()
}
