const threshold = 1.15  //设置比较阈值

//Mymath类，用于根据计算得分判断大致棋局是否相等，例如是否都是双活三或其他
//因为要忽略一些较小分值的数带来的影响，因此设定阈值进行比较
class Mymath {
  equal(a, b) {
    b = b || 0.01
    return b >= 0 ? ((a >= b / threshold) && (a <= b * threshold))
      : ((a >= b * threshold) && (a <= b / threshold))
  }
  greatThan(a, b) {
    return b >= 0 ? (a >= (b + 0.1) * threshold) : (a >= (b + 0.1) / threshold) // 注意处理b为0的情况，通过加一个0.1 做简单的处理
  }
  greatOrEqualThan(a, b) {
    return this.equal(a, b) || this.greatThan(a, b)
  }
  littleThan(a, b) {
    return b >= 0 ? (a <= (b - 0.1) / threshold) : (a <= (b - 0.1) * threshold)
  }
  littleOrEqualThan(a, b) {
    return this.equal(a, b) || this.littleThan(a, b)
  }
}

let math = new Mymath //实例化一个math对象