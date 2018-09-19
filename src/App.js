import '@css/base.css';
import '@css/style.scss';
import $ from 'jquery';
import JSZip from 'jszip';
import { saveAs } from 'file-saver/FileSaver';
import { loadImage, readFile, loadCanvas, downloadFile } from './utils';

// 这是为了更新html之后页面能自动刷新而写的。不要删
if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
}

const oPage = {
  init() {
    this.listen()
    this.files = null
    this.datas = []
    this.width = this.height = 0
  },
  setCount() {
    // 设置数目， 刷新表格
    $('.J_count').text(this.files.length)
    const tpl = [].slice.call(this.files).map((item, index) => {
      return `
      <tr data-index="${index}">
        <td class="r-1">${item.name}</td>
        <td class="r-2 f-center">待裁剪</td>
        <td class="r-3 f-center"><a href="javascript:;" class="J_download f-hide u-download" data-index="${index}">下载</a></td>
      </tr>
      `
    })
    $('.J_table_body').empty().append(tpl)
  },
  btnStatus(type) {
    // 设置按钮状态
    switch (+type) {
      case 1:
      // 准备保存
        $('.J_start_cropper').addClass('f-hide')
        $('.J_download_all').removeClass('f-hide')
        break
      case 2:
      // 准备裁剪
        $('.J_start_cropper').removeClass('f-hide')
        $('.J_download_all').addClass('f-hide')
        break
    }
  },
  listen() {
    $('.J_files_container').on('drop', (e) => {
      e.preventDefault()
      this.files = Array.from(e.originalEvent.dataTransfer.files).filter(item => {
        return item.type.indexOf('image') !== -1
      })
      this.setCount()
      $('.J_files_container').removeClass('f-waring')
      this.btnStatus(2)
    })
    $('.J_upload').on('change', (e) => {
      this.files = e.target.files
      this.setCount()
      $('.J_files_container').removeClass('f-waring')
      this.btnStatus(2)
    })
    $('.J_input').on('change', (e) => {
      // 检测输入框输入是否正确
      const value = e.target.value
      if (value === 0 || isNaN(value)) {
        $(e.target).addClass('f-waring')
        return
      }
      $(e.target).removeClass('f-waring')
      this.btnStatus(2)
    })
    $('body').on('click', '.J_download', (e) => {
      const target = $(e.target)
      const fileName = target.attr('data-fileName')
      const data = this.datas[target.attr('data-index')]
      downloadFile(data, fileName)
    })
    $('.J_start_cropper').on('click', async () => {
      if (this.files === null || this.files.length === 0) {
        // 检测是否选择图片
        $('.J_files_container').addClass('f-waring')
        return
      }
      this.width = Number($('.J_w').val())
      this.height = Number($('.J_h').val())
      if (this.width === 0 || isNaN(this.width)) {
        // 检测宽是否合法
        $('.J_w').addClass('f-waring')
        return
      }
      if (this.height === 0 || isNaN(this.height)) {
        // 检测高是否合法
        $('.J_h').addClass('f-waring')
        return
      }
      $('.J_table_body .r-2').text('待裁剪')
      await this.crop()
      this.btnStatus(1)
    })
    $('.J_download_all').on('click', () => {
      const zip = new JSZip()
      const btns = [].slice.call($('.J_download'))
      for (let i = 0; i < btns.length; i++) {
        const btn = $(btns[i])
        if (btn.hasClass('f-hide')) {
          continue
        }
        const fileName = btn.attr('data-fileName')
        const data = this.datas[btn.attr('data-index')]
        zip.file(fileName, data.split(',')[1], { base64: true })
      }
      zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'total.zip'))
    })
  },
  async crop() {
    this.datas.length = 0 // 因为文件重新选择, 所以将data置空
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i]
      const dataURL = await readFile(file)
      const image = await loadImage(dataURL)
      const canvas = loadCanvas(image, this.width, this.height)
      this.datas.push(canvas.toDataURL('image/png'))
      const tr = $('tbody').find(`tr[data-index="${i}"]`)
      tr.find('.r-2').text('已完成')
      tr.find('.r-3 .u-download').removeClass('f-hide').attr('data-fileName', file.name.split('.')[0] + '.png')
    }
  }
}

oPage.init()