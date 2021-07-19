const MAX = S.FIVE * 10	//极大值，必须大于最大情况下的得分
const MIN = -1 * MAX	//极小值

/**
 * 极小极大搜索的递归部分
 * @param deep	搜索深度
 * @param alpha alpha值
 * @param beta	beta值
 * @param role	当前层角色
 * @param step	记录当前已搜索层数
 * @param steps	候选搜索点数组
 * @param spread	当前已进行的冲四延申次数
 */
function recursion(deep, alpha, beta, role, step, steps, spread) {
	let nw_score = board.evaluate(role)	//当前的局势分

	//当前节点情况
	let leaf = {
		score: nw_score,
		step: step,
		steps: steps
	}

	//如果搜索到限制层数或搜索到的结果已获胜则返回当前节点
	if (deep <= 0 || math.greatOrEqualThan(nw_score, S.FIVE) || math.littleOrEqualThan(nw_score, -S.FIVE)) {
		return leaf
	}

	let ret = {
		score: MIN,
		step: step,
		steps: steps
	}

	let points = board.gen(role, step > 2)	//获得所有要考虑的点

	if (!points.length) return leaf

	for (let i = 0; i < points.length; i++) {
		let p = points[i]
		board.put(p, role)
		let _deep = deep - 1
		let _spread = spread

		//如果对方已经能获胜，则尝试冲四延伸
		if (_spread < config.spreadLimit) {
			if ((role == R.com && p.scoreHum >= S.FIVE) || (role == R.hum && p.scoreCom >= S.FIVE)) {
				_deep += 2
				_spread++
			}
		}

		let _steps = steps.slice(0)
		_steps.push(p)
		let v = recursion(_deep, -beta, -alpha, R.reverse(role), step + 1, _steps, _spread)
		v.score *= -1
		board.remove(p)

		//更新ret
		if (v.score > ret.score) {
			ret = v
		}

		//alpha剪枝，更新alpha值
		alpha = Math.max(ret.score, alpha)

		//beta剪枝
		if (math.greatThan(v.score, beta)) {
			v.score = MAX - 1	//该点被剪枝，用极大值记录
			return v
		}
	}
	return ret
}

/**
 * 极小极大搜索函数(的第一层)
 * @param candidates	参与考虑的结点
 * @param role	当前层角色
 * @param deep	搜索深度
 * @param alpha alpha值
 * @param beta	beta值
 */
function negamax(candidates, role, deep, alpha, beta) {
	board.current_steps = []	//清空当前搜索数组

	for (let i = 0; i < candidates.length; ++i) {
		let p = candidates[i]
		board.put(p, role)
		let steps = [p]
		let v = recursion(deep - 1, -beta, -alpha, R.reverse(role), 1, steps.slice(0), 0)
		v.score *= -1
		alpha = Math.max(alpha, v.score)
		board.remove(p)
		p.score = v.score
		p.step = v.step
		p.steps = v.steps
	}

	return alpha	//返回alpha值即为返回了最大得分
}

/**
 * 寻找最优方案
 * @param deep	搜索总深度
 */
function searchMethod(deep) {
	deep = deep === undefined ? config.searchDeep : deep
	const role = R.com	//进行搜索的角色一定是电脑
	const candidates = board.gen(role)	//选出当前局面的参考结点
	let best_score	//当前搜索最佳得分

	for (let i = 2; i <= deep; i += 2) {
		best_score = negamax(candidates, role, i, MIN, MAX)
		if (math.greatOrEqualThan(best_score, S.FIVE)) break
	}

	let ret = candidates[0]
	for (let i = 1; i < candidates.length; ++i) {
		if (math.equal(ret.score, candidates[i].score)) {
			// 大于0是优势，尽快获胜，因此取步数短的
			if (ret.score >= 0 && (ret.step > candidates[i].step || (ret.step == candidates[i].step && ret.score < candidates[i].score))) {
				ret = candidates[i]
			}
			// 小于0是劣势，尽量拖延，因此取步数长的
			else if (ret.step < candidates[i].step || (ret.step == candidates[i].step && ret.score < candidates[i].score)) {
				ret = candidates[i]
			}
		} else if (ret.score < candidates[i].score) {	//如果得分不同直接取得分高的
			ret = candidates[i]
		}
	}

	return ret
}