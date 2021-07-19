/**
 * 修复分数，使判断更合理
 * @param score		原始分值
 */
function fixScore(score) {
	if (score < S.FOUR && score >= S.BLOCKED_FOUR) {
		if (score >= S.BLOCKED_FOUR && score < S.BLOCKED_FOUR + S.THREE) {
			return S.THREE	//单独冲四，意义不大
		} else if (score >= S.BLOCKED_FOUR + S.THREE && score < S.BLOCKED_FOUR * 2) {
			return S.FOUR	//冲四活三，得分相当于自己形成活四
		} else {
			return S.FOUR * 2	//双冲四，分数提高
		}
	}
	return score;
}

//board棋盘类
class Board {
	/**
	 * 初始化棋盘函数
	 * @param size	棋盘大小
	 */
	init(size) {
		this.current_steps = []	//当前搜索的步骤
		this.all_steps = []		//总步骤
		this.count = 0	//已落子数量
		this.board = array.create(size, size)	//棋盘信息二维数组
		this.size = size	//棋盘大小
		this.com_score = array.create(size, size)	//电脑得分
		this.hum_score = array.create(size, size)	//玩家得分
		// score_cache[role][dir][row][col]
		this.score_cache = [
			[],
			[
				array.create(size, size),
				array.create(size, size),
				array.create(size, size),
				array.create(size, size)
			],
			[
				array.create(size, size),
				array.create(size, size),
				array.create(size, size),
				array.create(size, size)
			]
		]
	}

	/**
	 * 更新一个点附近的分数
	 * @param p		描述棋子的对象
	 */
	updateScore(p) {
		//棋子移动方式数组
		const imov = [
			[1, 0], // |
			[0, 1], // -
			[1, 1], // \
			[-1, 1] // /
		]
		const radius = 4	//更新范围
		let self = this,	//为了内层函数正常访问外层this，先将外层this存起来
			board = this.board,
			len = this.board.length

		//更新一个位置的得分
		function update(r, c, dir) {
			let role = board[r][c]
			if (role != R.hum) {
				self.com_score[r][c] = getPointScore(self, r, c, R.com, dir)
			} else {
				self.com_score[r][c] = 0;
			}
			if (role != R.com) {
				self.hum_score[r][c] = getPointScore(self, r, c, R.hum, dir)
			} else {
				self.hum_score[r][c] = 0;
			}
		}
		for (let i = 0; i < imov.length; ++i) {
			for (let j = -radius; j <= radius; ++j) {
				let r = p[0] + j * imov[i][0], c = p[1] + j * imov[i][1]	//计算要更新分数的棋子位置
				if (r < 0 || r >= len || c < 0 || c >= len || board[r][c] != R.empty)
					continue
				update(r, c, i)
			}
		}

	}

	/**
	 * 落子
	 * @param p		描述棋子的对象
	 * @param role	当前角色
	 */
	put(p, role) {
		this.board[p[0]][p[1]] = role
		this.updateScore(p)
		this.all_steps.push(p)
		this.current_steps.push(p)
		this.count++
	}

	/**
	 * 移除棋子
	 * @param p		描述棋子的对象
	 */
	remove(p) {
		this.board[p[0]][p[1]] = R.empty
		this.updateScore(p)
		this.all_steps.pop()
		this.current_steps.pop()
		this.count--
	}

	/**
	 * 回退(悔棋)
	 */
	backward() {
		if (this.all_steps.length < 2) return
		for (let i = 0; i < 2; ++i) {
			let p = this.all_steps[this.all_steps.length - 1]
			this.remove(p)
		}
	}

	/**
	 * 为某一角色估分
	 * @param role	当前角色
	 */
	evaluate(role) {
		let com_sum_score = 0
		let hum_sum_score = 0
		let board = this.board

		for (let i = 0; i < board.length; ++i) {
			for (let j = 0; j < board[i].length; ++j) {
				if (board[i][j] == R.com) {
					com_sum_score += fixScore(this.com_score[i][j])
				} else if (board[i][j] == R.hum) {
					hum_sum_score += fixScore(this.hum_score[i][j])
				}
			}
		}

		return (role == R.com ? 1 : -1) * (com_sum_score - hum_sum_score)
	}

	/**
	 * 启发函数，获得所有可能要考虑的落子位置
	 * @param role	当前角色
	 * @param only_threes	是否只返回>=3的位置
	 * @param star_spread	是否只返回米字形方向的位置
	 */
	gen(role, only_threes) {
		//游戏尚未开始，直接返回棋盘中点
		if (this.count <= 0) return [7, 7]

		let fives = []  //连五
		let comfours = [] //电脑连四
		let humfours = [] //玩家连四
		let comblockedfours = []  //电脑眠四
		let humblockedfours = []  //玩家眠四
		let comtwothrees = [] //电脑双三
		let humtwothrees = [] //玩家双三
		let comthrees = []  //电脑活三
		let humthrees = []  //玩家活三
		let comtwos = []  //电脑活二
		let humtwos = []  //玩家活二
		let neighbors = []  //记录搜索范围

		let board = this.board

		for (let i = 0; i < board.length; ++i) {
			for (let j = 0; j < board[i].length; ++j) {
				if (board[i][j] == R.empty) {	//该点目前为空，可以考虑
					if (!this.haveNeighbor(i, j, 2, 1)) continue

					let score_hum = this.hum_score[i][j]
					let score_com = this.com_score[i][j]
					let max_score = Math.max(score_com, score_hum)

					if (only_threes && max_score < S.THREE) continue

					let p = [i, j]
					p.score_hum = score_hum
					p.score_com = score_com
					p.score = max_score
					p.role = role

					if (score_com >= S.FIVE) {
						fives.push(p)
					} else if (score_hum >= S.FIVE) {
						fives.push(p)
					} else if (score_com >= S.FOUR) {
						comfours.push(p)
					} else if (score_hum >= S.FOUR) {
						humfours.push(p)
					} else if (score_com >= S.BLOCKED_FOUR) {
						comblockedfours.push(p)
					} else if (score_hum >= S.BLOCKED_FOUR) {
						humblockedfours.push(p)
					} else if (score_com >= 2 * S.THREE) {	//能成双三也行
						comtwothrees.push(p)
					} else if (score_hum >= 2 * S.THREE) {
						humtwothrees.push(p)
					} else if (score_com >= S.THREE) {
						comthrees.push(p)
					} else if (score_hum >= S.THREE) {
						humthrees.push(p)
					} else if (score_com >= S.TWO) {
						comtwos.unshift(p)
					} else if (score_hum >= S.TWO) {
						humtwos.unshift(p)
					} else neighbors.push(p)
				}
			}
		}

		// 如果成五，是必杀棋，直接返回
		if (fives.length) return fives

		// 如果自己能活四，则直接活四，不考虑冲四
		if (role === R.com && comfours.length) return comfours
		if (role === R.hum && humfours.length) return humfours

		// 如果对面有活四，自己冲四都没，则只考虑对面活四
		if (role === R.com && humfours.length && !comblockedfours.length) return humfours
		if (role === R.hum && comfours.length && !humblockedfours.length) return comfours

		// 如果对面有活四自己有冲四，则都考虑下
		let fours = role === R.com ? comfours.concat(humfours) : humfours.concat(comfours)
		let blockedfours = role === R.com ? comblockedfours.concat(humblockedfours) : humblockedfours.concat(comblockedfours)
		if (fours.length) return fours.concat(blockedfours)
		// if (role === R.com && humfours.length && comblockedfours.length)
		// 	return humfours.concat(comblockedfours)
		// if (role === R.hum && comfours.length && humblockedfours.length)
		// 	return comfours.concat(humblockedfours)

		let ret = []
		if (role === R.com) {
			ret =
				comtwothrees
					.concat(humtwothrees)
					.concat(comblockedfours)
					.concat(humblockedfours)
					.concat(comthrees)
					.concat(humthrees)
		}
		if (role === R.hum) {
			ret =
				humtwothrees
					.concat(comtwothrees)
					.concat(humblockedfours)
					.concat(comblockedfours)
					.concat(humthrees)
					.concat(comthrees)
		}

		//如果有双三也直接返回
		if (comtwothrees.length || humtwothrees.length || comthrees.length || humthrees.length) {
			return ret
		}

		// 如果只返回大于等于活三的棋
		if (only_threes) {
			return ret
		}

		let twos
		if (role === R.com) twos = comtwos.concat(humtwos)
		else twos = humtwos.concat(comtwos)

		twos.sort(function (a, b) { return b.score - a.score })	//从大到小排序
		ret = ret.concat(twos.length ? twos : neighbors)

		//这种分数低的，就不用全部计算了
		if (ret.length > config.countLimit) {
			return ret.slice(0, config.countLimit)
		}

		return ret
	}

	/**
	 * 判断某个位置周围是否有足够的邻居
	 * @param r		该位置行数
	 * @param c		该位置列数
	 * @param dis	距离
	 * @param cnt	所需邻居数量
	 */
	haveNeighbor(r, c, dis, cnt) {
		let board = this.board
		for (let i = Math.max(0, r - dis); i <= r + dis; ++i) {
			if (i >= this.size) break
			for (let j = Math.max(0, c - dis); j <= c + dis; ++j) {
				if (j >= this.size) break;
				if (i == r && j == c) continue;
				if (board[i][j] != R.empty) {
					--cnt
					if (cnt <= 0)
						return true;
				}
			}
		}
		return false
	}

}

let board = new Board()	//实例化一个board对象