$(function () {
	const form = layui.form
	const layer = layui.layer
	// 定义一个查询的参数对象，将来请求数据的时候，
	// 需要将请求参数对象提交到服务器
	const q = {
		pagenum: 1, // 页码值，默认请求第一页的数据
		pagesize: 2, // 每页显示几条数据，默认每页显示2条
		cate_id: '', // 文章分类的 Id
		state: '' // 文章的发布状态
	}
	const laypage = layui.laypage

	initTable()

	// 获取文章列表数据并渲染的方法
	function initTable() {
		$.ajax({
			method: 'GET',
			url: '/my/article/list',
			data: q,
			success: function (res) {
				if (res.status !== 0) {
					return layer.msg('获取文章列表失败！')
				}
				// 使用模板引擎渲染页面的数据
				var htmlStr = template('tpl-table', res)
				$('tbody').html(htmlStr)

				// 调用渲染分页的方法
				renderPage(res.total)
			}
		})
	}

	// 定义美化时间的过滤器
	template.defaults.imports.dataFormat = function (date) {
		const dt = new Date(date)

		const y = dt.getFullYear()
		const m = padZero(dt.getMonth() + 1)
		const d = padZero(dt.getDate())

		const hh = padZero(dt.getHours())
		const mm = padZero(dt.getMinutes())
		const ss = padZero(dt.getSeconds())

		return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
	}

	// 定义补零的函数
	function padZero(n) {
		return n > 9 ? n : '0' + n
	}

	initCate()

	// 初始化文章分类的方法
	function initCate() {
		$.ajax({
			method: 'GET',
			url: '/my/article/cates',
			success: function (res) {
				if (res.status !== 0) {
					return layer.msg('获取分类数据失败！')
				}
				// 调用模板引擎渲染分类的可选项
				var htmlStr = template('tpl-cate', res)
				$('[name=cate_id]').html(htmlStr)
				// 通过 layui 重新渲染表单区域的UI结构
				form.render()
			}
		})
	}
	//筛选功能
	$('#form-search').on('submit', function (e) {
		e.preventDefault()
		// 获取表单中选中项的值
		const cate_id = $('[name=cate_id]').val()
		const state = $('[name=state]').val()
		// 为查询参数对象 q 中对应的属性赋值
		q.cate_id = cate_id
		q.state = state
		// 根据最新的筛选条件，重新渲染表格的数据
		initTable()
	})

	// 定义渲染分页的方法
	function renderPage(total) {
		// 调用 laypage.render() 方法来渲染分页的结构
		laypage.render({
			elem: 'pageBox', // 分页容器的 Id
			count: total, // 总数据条数
			limit: q.pagesize, // 每页显示几条数据
			curr: q.pagenum, // 设置默认被选中的分页
			layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
			limits: [2, 3, 5, 10],
			// 分页发生切换的时候，触发 jump 回调
			// 触发 jump 回调的方式有两种：
			// 1. 点击页码的时候，会触发 jump 回调
			// 2. 只要调用了 laypage.render() 方法，就会触发 jump 回调
			jump: function (obj, first) {
				// 可以通过 first 的值，来判断是通过哪种方式，触发的 jump 回调
				// 如果 first 的值为 true，证明是方式2触发的
				// 否则就是方式1触发的
				/* 	console.log(first)
				console.log(obj.curr) */
				// console.log(obj.limit)
				// 把最新的页码值，赋值到 q 这个查询参数对象中
				q.pagenum = obj.curr
				// 把最新的条目数,赋值到q的pagesize中
				q.pagesize = obj.limit
				// 根据最新的 q 获取对应的数据列表，并渲染表格
				// initTable()
				if (!first) {
					initTable()
				}
			}
		})
	}

	//  通过事件委托的,为删除按钮绑定事件
	$('tbody').on('click', '.btn-delete', function () {
		const id = $(this).attr('data-id')
		const len = $('btn-delete').length
		// 询问用户是否删除
		layer.confirm('确认删除吗?', { icon: 3, title: '提示' }, function (index) {
			//do something
			$.ajax({
				method: 'GET',
				url: `/my/article/delete/${id}`,
				success(res) {
					if (res.status !== 0) {
						return layer.msg('删除文章失败!')
					}
					layer.msg('删除文章成功!')
					// 判断当前页面中是否还有剩余的数据,如果没有,则让当前页码值减1再重新获取
					if (len === 1) {
						// 证明当前页面中删除完毕后就没有数据了且页码值最小为1
						q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
					}
					initTable()
				}
			})
			layer.close(index)
		})
	})
})
