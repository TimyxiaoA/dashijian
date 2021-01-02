$(function () {
	let layer = layui.layer
	// 1.1 获取裁剪区域的 DOM 元素
	const $image = $('#image')
	// 1.2 配置选项
	const options = {
		// 纵横比
		aspectRatio: 1,
		// 指定预览区域
		preview: '.img-preview'
	}

	// 1.3 创建裁剪区域
	$image.cropper(options)

	$('#btnChooseImage').on('click', function () {
		$('#file').click()
	})

	// 为文件选择框绑定 change 事件
	$('#file').on('change', function () {
		// 获取用户选择的文件
		const filelist = this.files
		if (filelist.length === 0) {
			return layer.msg('请选择照片！')
		}

		// 1. 拿到用户选择的文件
		const file = filelist[0]
		// 2. 将文件，转化为路径
		const imgURL = URL.createObjectURL(file)
		// 3. 重新初始化裁剪区域
		$image
			.cropper('destroy') // 销毁旧的裁剪区域
			.attr('src', imgURL) // 重新设置图片路径
			.cropper(options) // 重新初始化裁剪区域
	})
	$('#btnReset').on('click', function () {
		const dataURL = $image
			.cropper('getCroppedCanvas', {
				// 创建一个 Canvas 画布
				width: 100,
				height: 100
			})
			.toDataURL('image/png')

		$.ajax({
			method: 'POST',
			url: '/my/update/avatar',
			data: {
				avatar: dataURL
			},
			success: function (res) {
				console.log(res)
				if (res.status !== 0) {
					return layer.msg('更换头像失败！')
				}
				layer.msg('更换头像成功！')
				window.parent.getUserInfo()
			}
		})
	})
})
