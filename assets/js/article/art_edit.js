$(function () {
	const str1 = location.search
	// console.log(str)
	function formatParams(str) {
		// 方法 1
		/* const obj = {}
		let r = str.split('?')[1].split('&')
		for (let i = 0; i < r.length; i++) {
			let arr = r[i].split('=')
			obj[arr[0]] = arr[1]
    }
    return obj */
		//方法 2
		const obj = {}
		let r = str.split('?')[1].split(/=|&/)
		for (let i = 0; i < r.length; i += 2) {
			obj[r[i]] = r[i + 1]
		}
		return obj
	}

	const obj = formatParams(str1)
	// console.log(obj)
	//文章id就是 obj.id

	// 根据文章的 ID 获取文章详情
	function getArticleDetails(id) {
		// console.log(id, 33)
		$.ajax({
			method: 'GET',
			url: `/my/article/${id}`,
			success(res) {
				if (res.status !== 0) return layer.msg('获取文章分类失败!')
				// 填充数据
				// layui.form.val('artEdit', res.data)
				// 要等到分类也加载并渲染完毕了再填充
				initCate(res.data)
			}
		})
	}
	getArticleDetails(obj.id)

	const layer = layui.layer
	const form = layui.form
	//加载文章分类
	// initCate()
	//初始化富文本编辑器
	initEditor()

	function initCate(data) {
		$.ajax({
			method: 'GET',
			url: '/my/article/cates',
			success(res) {
				// console.log(res)
				if (res.status !== 0) {
					return layer.msg('获取分类失败!')
				}
				// 调用模板引擎，渲染分类的下拉菜单
				const htmlStr = template('tpl-cate', res)
				$('[name=cate_id]').html(htmlStr)
				// 一定要记得调用 form.render() 方法
				form.render()

				// 要等到分类也加载并渲染完毕了再填充
				form.val('artEdit', data)
				// 富文本编辑器里面并没有默认的内容，只有新版本才支持，这里使用手动填充
				document.querySelector('#content_ifr').contentDocument.querySelector('#tinymce').innerHTML = data.content

				// 渲染当前用户的头像
				$image.prop('src', 'http://ajax.frontend.itheima.net' + data.cover_img)
				// 等图片 src 正确了之后，再进行初始化
				// 3. 初始化裁剪区域
				$image.cropper(options)
			}
		})
	}

	// 1. 初始化图片裁剪器
	const $image = $('#image')

	// 2. 裁剪选项
	const options = {
		aspectRatio: 400 / 280,
		preview: '.img-preview'
	}

	// 3. 初始化裁剪区域
	// $image.cropper(options)

	// 为选择封面的按钮，绑定点击事件处理函数
	$('#btnChooseImage').on('click', function () {
		$('#coverFile').click()
	})

	// 监听 coverFile 的 change 事件，获取用户选择的文件列表
	$('#coverFile').on('change', function (e) {
		// 获取到文件的列表数组
		var files = e.target.files
		// 判断用户是否选择了文件
		if (files.length === 0) {
			return
		}
		// 根据文件，创建对应的 URL 地址
		var newImgURL = URL.createObjectURL(files[0])
		// 为裁剪区域重新设置图片
		$image
			.cropper('destroy') // 销毁旧的裁剪区域
			.attr('src', newImgURL) // 重新设置图片路径
			.cropper(options) // 重新初始化裁剪区域
	})

	// 监听 coverFile 的 change 事件，获取用户选择的文件列表
	$('#coverFile').on('change', function (e) {
		// 获取到文件的列表数组
		var files = e.target.files
		// 判断用户是否选择了文件
		if (files.length === 0) {
			return
		}
		// 根据文件，创建对应的 URL 地址
		var newImgURL = URL.createObjectURL(files[0])
		// 为裁剪区域重新设置图片
		$image
			.cropper('destroy') // 销毁旧的裁剪区域
			.attr('src', newImgURL) // 重新设置图片路径
			.cropper(options) // 重新初始化裁剪区域
	})

	let art_state = '已发布'
	$('#btnSave2').on('click', function () {
		art_state = '草稿'
	})

	/* 为表单绑定 `submit` 提交事件
- 1阻止表单默认提交行为
- 2基于 `form` 表单，快速创建一个 `FormData` 对象
- 3将文章的发布状态，存到 `FormData` 对象中 */
	$('#form-pub').on('submit', function (e) {
		e.preventDefault()
		const fd = new FormData(this)
		fd.append('state', art_state)

		// 4. 将封面裁剪过后的图片，输出为一个文件对象
		$image
			.cropper('getCroppedCanvas', {
				// 创建一个 Canvas 画布
				width: 400,
				height: 280
			})
			.toBlob(function (blob) {
				// 将 Canvas 画布上的内容，转化为文件对象
				// 得到文件对象后，进行后续的操作
				// 5. 将文件对象，存储到 fd 中
				fd.append('cover_img', blob)
				//文章id
				fd.append('Id', obj.id)
				// 6. 发起 ajax 数据请求
				publishArticle(fd)
			})
	})

	function publishArticle(fd) {
		$.ajax({
			method: 'POST',
			url: '/my/article/edit',
			data: fd,
			// 注意：如果向服务器提交的是 FormData 格式的数据，
			// 必须添加以下两个配置项
			contentType: false,
			processData: false,
			success(res) {
				if (res.status !== 0) {
					return layer.msg('发布文章失败!')
				}
				layer.msg('发布文章成功!')
				//让他的父亲的a标签发布文章触发点击事件
				window.parent.$('#art_lists')[0].click()
			}
		})
	}
})
