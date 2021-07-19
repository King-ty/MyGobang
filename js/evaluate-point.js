/**
 * 获得某点得分，有可能该点并未落子，预先估算得分
 * @param b     棋盘board对象
 * @param nr    当前行数
 * @param nc    当前列数
 * @param role  当前角色    
 * @param dir   查找方向
 */
function getPointScore(b, nr, nc, role, dir) {
    //移动情况数组
    const imov = [
        [1, 0], // |
        [0, 1], // -
        [1, 1], // \
        [-1, 1] // /
    ]

    let board = b.board
    let len = board.length
    let ret = 0

    //获得某一方向的分数
    function getDirectScore(r, c, _dir) {
        let empty_pos = -1, cnt = 1, block = 0
        let pr = r, pc = c  //保存原位置

        for (; ;) {
            r += imov[_dir][0];
            c += imov[_dir][1];
            if (r >= len || c >= len || r < 0 || c < 0) {
                ++block
                break
            }
            let temp = board[r][c]  //获取当前点的内容
            if (temp === R.empty) { //当前点为空，进行判断，搜索时最多有一个空
                if (empty_pos == -1 && r + imov[_dir][0] < len && c + imov[_dir][1] < len && r + imov[_dir][0] >= 0 && c + imov[_dir][1] >= 0 && board[r + imov[_dir][0]][c + imov[_dir][1]] == role) {
                    empty_pos = cnt
                }
                else
                    break
            } else if (temp === role) { //当前点和原位置的角色相同
                ++cnt
            } else {
                ++block
                break
            }
        }
        r = pr
        c = pc
        for (; ;) {
            r -= imov[_dir][0];
            c -= imov[_dir][1];
            if (r >= len || c >= len || r < 0 || c < 0) {
                ++block
                break
            }
            let temp = board[r][c] //获取当前点的内容
            if (temp === R.empty) { //当前点为空，进行判断，搜索时最多有一个空
                if (empty_pos == -1 && r + imov[_dir][0] < len && c + imov[_dir][1] < len && r + imov[_dir][0] >= 0 && c + imov[_dir][1] >= 0 && board[r + imov[_dir][0]][c + imov[_dir][1]] == role) {
                    empty_pos = 0
                }
                else
                    break
            } else if (temp === role) { //当前点和原位置的角色相同
                ++cnt

                //注意更新空位的位置
                if (empty_pos != -1)
                    ++empty_pos
            } else {
                ++block
                break
            }
        }
        //缓存得分情况
        b.score_cache[role][_dir][pr][pc] = cntToScore(cnt, block, empty_pos)
        // ret += b.score_cache[role][_dir][pr][pc]
    }

    //如果未定义查找方向，则所有方向都查找
    if (dir === undefined) {
        for (let i = 0; i < imov.length; ++i) {
            getDirectScore(nr, nc, i)
        }
    }
    //否则只查找相应方向
    else {
        getDirectScore(nr, nc, dir)
    }

    for (let i = 0; i < imov.length; ++i) {
        ret += b.score_cache[role][i][nr][nc]
    }

    return ret
}

/**
 * 将查找到的相关信息计算得分
 * @param cnt   相同点的数量
 * @param block 两端阻塞情况
 * @param empty_pos 空位的位置
 */
function cntToScore(cnt, block, empty_pos) {
    if (empty_pos === undefined) empty_pos = 0
    if (empty_pos <= 0) { //如果没有空位
        if (cnt >= 5)
            return S.FIVE
        if (block == 0) {
            switch (cnt) {
                case 1: return S.ONE
                case 2: return S.TWO
                case 3: return S.THREE
                case 4: return S.FOUR
            }
        }
        if (block == 1) {
            switch (cnt) {
                case 1: return S.BLOCKED_ONE
                case 2: return S.BLOCKED_TWO
                case 3: return S.BLOCKED_THREE
                case 4: return S.BLOCKED_FOUR
            }
        }
    } else if (empty_pos === 1 || empty_pos == cnt - 1) {   //如果第1个是空位

        if (cnt >= 6) {
            return S.FIVE
        }
        if (block === 0) {
            switch (cnt) {
                case 2: return S.TWO / 2
                case 3: return S.THREE
                case 4: return S.BLOCKED_FOUR
                case 5: return S.FOUR
            }
        }
        if (block === 1) {
            switch (cnt) {
                case 2: return S.BLOCKED_TWO
                case 3: return S.BLOCKED_THREE
                case 4: return S.BLOCKED_FOUR
                case 5: return S.BLOCKED_FOUR
            }
        }
    } else if (empty_pos === 2 || empty_pos == cnt - 2) {   //如果第2个是空位
        if (cnt >= 7) {
            return S.FIVE
        }
        if (block === 0) {
            switch (cnt) {
                case 3: return S.THREE
                case 4:
                case 5: return S.BLOCKED_FOUR
                case 6: return S.FOUR
            }
        }
        if (block === 1) {
            switch (cnt) {
                case 3: return S.BLOCKED_THREE
                case 4: return S.BLOCKED_FOUR
                case 5: return S.BLOCKED_FOUR
                case 6: return S.FOUR
            }
        }
        if (block === 2) {
            switch (cnt) {
                case 4:
                case 5:
                case 6: return S.BLOCKED_FOUR
            }
        }
    } else if (empty_pos === 3 || empty_pos == cnt - 3) {   //如果第3个是空位
        if (cnt >= 8) {
            return S.FIVE
        }
        if (block === 0) {
            switch (cnt) {
                case 4:
                case 5: return S.THREE
                case 6: return S.BLOCKED_FOUR
                case 7: return S.FOUR
            }
        }

        if (block === 1) {
            switch (cnt) {
                case 4:
                case 5:
                case 6: return S.BLOCKED_FOUR
                case 7: return S.FOUR
            }
        }

        if (block === 2) {
            switch (cnt) {
                case 4:
                case 5:
                case 6:
                case 7: return S.BLOCKED_FOUR
            }
        }
    } else if (empty_pos === 4 || empty_pos == cnt - 4) {   //如果第4个是空位
        if (cnt >= 9) {
            return S.FIVE
        }
        if (block === 0) {
            switch (cnt) {
                case 5:
                case 6:
                case 7:
                case 8: return S.FOUR
            }
        }

        if (block === 1) {
            switch (cnt) {
                case 4:
                case 5:
                case 6:
                case 7: return S.BLOCKED_FOUR//这里有一种情况不会出现，所以是没错的
                case 8: return S.FOUR
            }
        }

        if (block === 2) {
            switch (cnt) {
                case 5:
                case 6:
                case 7:
                case 8: return S.BLOCKED_FOUR
            }
        }
    } else if (empty_pos === 5 || empty_pos == cnt - 5) {   //如果第5个是空位
        return S.FIVE
    }
    return 0    //其他情况都返回0
}