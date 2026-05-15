<template>
  <div class="shot-division">
    <el-card class="header-card">
      <div slot="header" class="clearfix">
        <h1>🎬 影视镜头分镜拆解工具</h1>
      </div>
      <div class="project-info">
        <el-form :inline="true" :model="projectInfo" class="demo-form-inline">
          <el-form-item label="项目名称">
            <el-input v-model="projectInfo.name" placeholder="请输入项目名称"></el-input>
          </el-form-item>
          <el-form-item label="导演">
            <el-input v-model="projectInfo.director" placeholder="导演"></el-input>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker v-model="projectInfo.date" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operation-card" style="margin-top: 20px;">
      <el-button type="primary" @click="showAddDialog">
        <i class="el-icon-plus"></i> 添加镜头
      </el-button>
      <el-button type="success" @click="saveProject">
        <i class="el-icon-save"></i> 保存项目
      </el-button>
      <el-button type="info" @click="showProjectList">
        <i class="el-icon-folder-opened"></i> 项目列表
      </el-button>
      <el-button type="info" @click="loadPresetData">
        <i class="el-icon-document-copy"></i> 加载预设示例
      </el-button>
      <el-button type="success" @click="exportScript">
        <i class="el-icon-download"></i> 导出脚本
      </el-button>
      <el-button type="warning" @click="clearAll">
        <i class="el-icon-delete"></i> 清空全部
      </el-button>
    </el-card>

    <el-card class="shots-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <span>分镜列表 (共 {{ shots.length }} 个镜头)</span>
      </div>
      
      <div v-if="shots.length === 0" class="empty-state">
        <el-empty description="暂无镜头数据，点击上方按钮添加镜头"></el-empty>
      </div>

      <div v-else class="shot-list">
        <div v-for="(shot, index) in shots" :key="shot.id" class="shot-item">
          <div class="shot-header">
            <span class="shot-number">镜头 {{ String(index + 1).padStart(3, '0') }}</span>
            <div class="shot-actions">
              <el-button size="mini" type="primary" @click="editShot(shot)">编辑</el-button>
              <el-button size="mini" type="danger" @click="deleteShot(shot.id)">删除</el-button>
              <el-button size="mini" icon="el-icon-top" :disabled="index === 0" @click="moveUp(index)">上移</el-button>
              <el-button size="mini" icon="el-icon-bottom" :disabled="index === shots.length - 1" @click="moveDown(index)">下移</el-button>
            </div>
          </div>
          
          <div class="shot-content">
            <div class="shot-image-section">
              <div class="shot-image" v-if="shot.image">
                <img :src="shot.image" alt="镜头画面" />
              </div>
              <div v-else class="shot-placeholder">
                <i class="el-icon-picture-outline"></i>
                <p>暂无图片</p>
              </div>
              <el-upload
                class="image-upload"
                :show-file-list="false"
                :before-upload="(file) => beforeUpload(file, shot.id)"
                accept="image/*">
                <el-button size="small" type="primary">上传画面</el-button>
              </el-upload>
            </div>
            
            <div class="shot-details">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="detail-item">
                    <span class="label">景别:</span>
                    <el-tag type="info">{{ shot.shotType }}</el-tag>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="detail-item">
                    <span class="label">运镜:</span>
                    <el-tag type="success">{{ shot.cameraMove }}</el-tag>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="detail-item">
                    <span class="label">时长:</span>
                    <el-tag type="warning">{{ shot.duration }}秒</el-tag>
                  </div>
                </el-col>
              </el-row>
              
              <div class="shot-description" style="margin-top: 15px;">
                <div class="label">场景描述:</div>
                <p>{{ shot.description || '暂无描述' }}</p>
              </div>
              
              <div class="shot-notes" style="margin-top: 10px;">
                <div class="label">备注:</div>
                <p>{{ shot.notes || '无' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="currentShot" label-width="100px">
        <el-form-item label="景别">
          <el-select v-model="currentShot.shotType" placeholder="请选择景别" style="width: 100%;">
            <el-option label="大远景 (ELS)" value="大远景 (ELS)"></el-option>
            <el-option label="远景 (LS)" value="远景 (LS)"></el-option>
            <el-option label="全景 (FS)" value="全景 (FS)"></el-option>
            <el-option label="中景 (MS)" value="中景 (MS)"></el-option>
            <el-option label="中近景 (MCU)" value="中近景 (MCU)"></el-option>
            <el-option label="近景 (CU)" value="近景 (CU)"></el-option>
            <el-option label="特写 (ECU)" value="特写 (ECU)"></el-option>
            <el-option label="大特写 (XCU)" value="大特写 (XCU)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运镜">
          <el-select v-model="currentShot.cameraMove" placeholder="请选择运镜方式" style="width: 100%;">
            <el-option label="固定镜头 (FIX)" value="固定镜头 (FIX)"></el-option>
            <el-option label="推镜 (PUSH IN)" value="推镜 (PUSH IN)"></el-option>
            <el-option label="拉镜 (PULL OUT)" value="拉镜 (PULL OUT)"></el-option>
            <el-option label="摇镜 (PAN)" value="摇镜 (PAN)"></el-option>
            <el-option label="移镜 (DOLLY)" value="移镜 (DOLLY)"></el-option>
            <el-option label="跟镜 (FOLLOW)" value="跟镜 (FOLLOW)"></el-option>
            <el-option label="升镜 (TILT UP)" value="升镜 (TILT UP)"></el-option>
            <el-option label="降镜 (TILT DOWN)" value="降镜 (TILT DOWN)"></el-option>
            <el-option label="旋转 (ROTATE)" value="旋转 (ROTATE)"></el-option>
            <el-option label="手持 (HANDHELD)" value="手持 (HANDHELD)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时长(秒)">
          <el-input-number v-model="currentShot.duration" :min="0.1" :step="0.5" :precision="1"></el-input-number>
        </el-form-item>
        <el-form-item label="场景描述">
          <el-input type="textarea" v-model="currentShot.description" :rows="4" placeholder="描述这个镜头的内容..."></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="currentShot.notes" :rows="2" placeholder="其他备注信息..."></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveShot">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="📁 项目列表" :visible.sync="projectListVisible" width="600px">
      <div v-if="projectList.length === 0" style="text-align: center; padding: 40px;">
        <el-empty description="暂无保存的项目"></el-empty>
      </div>
      <div v-else class="project-list">
        <div v-for="project in projectList" :key="project.id" class="project-item">
          <div class="project-info-main">
            <div class="project-name">{{ project.name || '未命名项目' }}</div>
            <div class="project-meta">
              <span>镜头: {{ project.shots ? project.shots.length : 0 }}个</span>
              <span>导演: {{ project.director || '-' }}</span>
              <span>更新: {{ formatDate(project.updatedAt) }}</span>
            </div>
          </div>
          <div class="project-actions">
            <el-button size="small" type="primary" @click="loadProject(project)">
              <i class="el-icon-upload2"></i> 加载
            </el-button>
            <el-button size="small" type="danger" @click="deleteProject(project.id)">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="projectListVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ShotDivision',
  data() {
    return {
      projectInfo: {
        name: '示例电影项目',
        director: '张导演',
        date: new Date()
      },
      shots: [
        {
          id: 1,
          shotType: '大远景 (ELS)',
          cameraMove: '固定镜头 (FIX)',
          duration: 5,
          description: '城市全景，日出时分，展现整个城市的轮廓和天际线，阳光从东方缓缓升起。',
          notes: '需要航拍',
          image: ''
        },
        {
          id: 2,
          shotType: '全景 (FS)',
          cameraMove: '推镜 (PUSH IN)',
          duration: 3.5,
          description: '主角站在高楼顶端，背对镜头，俯瞰整个城市。镜头慢慢推向主角。',
          notes: '绿幕拍摄',
          image: ''
        },
        {
          id: 3,
          shotType: '中景 (MS)',
          cameraMove: '跟镜 (FOLLOW)',
          duration: 4,
          description: '主角转身走向楼梯，镜头跟随其脚步，展示坚定的步伐和背影。',
          notes: '稳定器拍摄',
          image: ''
        },
        {
          id: 4,
          shotType: '近景 (CU)',
          cameraMove: '固定镜头 (FIX)',
          duration: 2.5,
          description: '主角面部特写，眼神坚定，略带忧郁，微风吹动发丝。',
          notes: '打光要柔和',
          image: ''
        },
        {
          id: 5,
          shotType: '特写 (ECU)',
          cameraMove: '固定镜头 (FIX)',
          duration: 2,
          description: '手部特写，主角握紧拳头，指节微微发白，表现内心的挣扎。',
          notes: '手部模型',
          image: ''
        },
        {
          id: 6,
          shotType: '中景 (MS)',
          cameraMove: '摇镜 (PAN)',
          duration: 6,
          description: '会议室全景，多人讨论激烈。镜头从左向右摇过，展示每个人的表情。',
          notes: '轨道拍摄',
          image: ''
        },
        {
          id: 7,
          shotType: '中近景 (MCU)',
          cameraMove: '手持 (HANDHELD)',
          duration: 3,
          description: '反派与主角对峙，两人针锋相对，呼吸急促。手持增加紧张感。',
          notes: '呼吸感要足',
          image: ''
        },
        {
          id: 8,
          shotType: '远景 (LS)',
          cameraMove: '拉镜 (PULL OUT)',
          duration: 4.5,
          description: '夜晚街道，主角独自离开。镜头逐渐拉远，人物消失在人群中。',
          notes: '夜景布光',
          image: ''
        }
      ],
      dialogVisible: false,
      isEdit: false,
      currentShot: {
        id: null,
        shotType: '',
        cameraMove: '',
        duration: 3,
        description: '',
        notes: '',
        image: ''
      },
      projectListVisible: false,
      projectList: [],
      currentProjectId: null
    }
  },
  mounted() {
    this.loadProjectList()
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑镜头' : '添加镜头'
    }
  },
  methods: {
    showAddDialog() {
      this.isEdit = false
      this.currentShot = {
        id: Date.now(),
        shotType: '',
        cameraMove: '',
        duration: 3,
        description: '',
        notes: '',
        image: ''
      }
      this.dialogVisible = true
    },
    editShot(shot) {
      this.isEdit = true
      this.currentShot = { ...shot }
      this.dialogVisible = true
    },
    saveShot() {
      if (!this.currentShot.shotType || !this.currentShot.cameraMove) {
        this.$message.warning('请填写景别和运镜信息')
        return
      }
      
      if (this.isEdit) {
        const index = this.shots.findIndex(s => s.id === this.currentShot.id)
        if (index !== -1) {
          this.shots[index] = { ...this.currentShot }
        }
      } else {
        this.shots.push({ ...this.currentShot })
      }
      this.dialogVisible = false
      this.$message.success(this.isEdit ? '编辑成功' : '添加成功')
    },
    deleteShot(id) {
      this.$confirm('确定要删除这个镜头吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.shots = this.shots.filter(s => s.id !== id)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    moveUp(index) {
      if (index > 0) {
        [this.shots[index], this.shots[index - 1]] = [this.shots[index - 1], this.shots[index]]
      }
    },
    moveDown(index) {
      if (index < this.shots.length - 1) {
        [this.shots[index], this.shots[index + 1]] = [this.shots[index + 1], this.shots[index]]
      }
    },
    beforeUpload(file, shotId) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const shot = this.shots.find(s => s.id === shotId)
        if (shot) {
          shot.image = e.target.result
        }
      }
      reader.readAsDataURL(file)
      return false
    },
    exportScript() {
      if (this.shots.length === 0) {
        this.$message.warning('暂无镜头数据')
        return
      }
      
      let content = `项目名称: ${this.projectInfo.name || '未命名'}\n`
      content += `导演: ${this.projectInfo.director || '未填写'}\n`
      content += `日期: ${this.projectInfo.date || '未设置'}\n`
      content += `镜头总数: ${this.shots.length}\n\n`
      content += '='.repeat(80) + '\n\n'
      
      this.shots.forEach((shot, index) => {
        content += `【镜头 ${String(index + 1).padStart(3, '0')}】\n`
        content += `景别: ${shot.shotType}\n`
        content += `运镜: ${shot.cameraMove}\n`
        content += `时长: ${shot.duration}秒\n`
        content += `描述: ${shot.description || '无'}\n`
        content += `备注: ${shot.notes || '无'}\n`
        content += '-'.repeat(60) + '\n\n'
      })
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.projectInfo.name || '分镜脚本'}_${new Date().toLocaleDateString()}.txt`
      link.click()
      URL.revokeObjectURL(url)
      
      this.$message.success('导出成功')
    },
    loadPresetData() {
      this.projectInfo = {
        name: '示例电影项目',
        director: '张导演',
        date: new Date()
      }
      this.shots = [
        {
          id: Date.now() + 1,
          shotType: '大远景 (ELS)',
          cameraMove: '固定镜头 (FIX)',
          duration: 5,
          description: '城市全景，日出时分，展现整个城市的轮廓和天际线，阳光从东方缓缓升起。',
          notes: '需要航拍',
          image: ''
        },
        {
          id: Date.now() + 2,
          shotType: '全景 (FS)',
          cameraMove: '推镜 (PUSH IN)',
          duration: 3.5,
          description: '主角站在高楼顶端，背对镜头，俯瞰整个城市。镜头慢慢推向主角。',
          notes: '绿幕拍摄',
          image: ''
        },
        {
          id: Date.now() + 3,
          shotType: '中景 (MS)',
          cameraMove: '跟镜 (FOLLOW)',
          duration: 4,
          description: '主角转身走向楼梯，镜头跟随其脚步，展示坚定的步伐和背影。',
          notes: '稳定器拍摄',
          image: ''
        },
        {
          id: Date.now() + 4,
          shotType: '近景 (CU)',
          cameraMove: '固定镜头 (FIX)',
          duration: 2.5,
          description: '主角面部特写，眼神坚定，略带忧郁，微风吹动发丝。',
          notes: '打光要柔和',
          image: ''
        },
        {
          id: Date.now() + 5,
          shotType: '特写 (ECU)',
          cameraMove: '固定镜头 (FIX)',
          duration: 2,
          description: '手部特写，主角握紧拳头，指节微微发白，表现内心的挣扎。',
          notes: '手部模型',
          image: ''
        },
        {
          id: Date.now() + 6,
          shotType: '中景 (MS)',
          cameraMove: '摇镜 (PAN)',
          duration: 6,
          description: '会议室全景，多人讨论激烈。镜头从左向右摇过，展示每个人的表情。',
          notes: '轨道拍摄',
          image: ''
        },
        {
          id: Date.now() + 7,
          shotType: '中近景 (MCU)',
          cameraMove: '手持 (HANDHELD)',
          duration: 3,
          description: '反派与主角对峙，两人针锋相对，呼吸急促。手持增加紧张感。',
          notes: '呼吸感要足',
          image: ''
        },
        {
          id: Date.now() + 8,
          shotType: '远景 (LS)',
          cameraMove: '拉镜 (PULL OUT)',
          duration: 4.5,
          description: '夜晚街道，主角独自离开。镜头逐渐拉远，人物消失在人群中。',
          notes: '夜景布光',
          image: ''
        }
      ]
      this.$message.success('预设数据加载成功，共 ' + this.shots.length + ' 个镜头')
    },
    loadProjectList() {
      try {
        const saved = localStorage.getItem('shotDivisionProjects')
        if (saved) {
          this.projectList = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载项目列表失败', e)
      }
    },
    saveProject() {
      if (!this.projectInfo.name) {
        this.$message.warning('请先填写项目名称')
        return
      }
      
      const project = {
        id: this.currentProjectId || Date.now(),
        name: this.projectInfo.name,
        director: this.projectInfo.director,
        date: this.projectInfo.date,
        shots: [...this.shots],
        createdAt: this.currentProjectId ? undefined : new Date(),
        updatedAt: new Date()
      }
      
      const index = this.projectList.findIndex(p => p.id === project.id)
      if (index !== -1) {
        project.createdAt = this.projectList[index].createdAt
        this.projectList[index] = project
      } else {
        this.projectList.unshift(project)
      }
      
      this.currentProjectId = project.id
      
      try {
        localStorage.setItem('shotDivisionProjects', JSON.stringify(this.projectList))
        this.$message.success('项目保存成功')
      } catch (e) {
        console.error('保存项目失败', e)
        this.$message.error('保存失败')
      }
    },
    showProjectList() {
      this.loadProjectList()
      this.projectListVisible = true
    },
    loadProject(project) {
      this.currentProjectId = project.id
      this.projectInfo = {
        name: project.name,
        director: project.director,
        date: project.date
      }
      this.shots = [...project.shots]
      this.projectListVisible = false
      this.$message.success('项目加载成功')
    },
    deleteProject(id) {
      this.$confirm('确定要删除这个项目吗？删除后无法恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.projectList = this.projectList.filter(p => p.id !== id)
        try {
          localStorage.setItem('shotDivisionProjects', JSON.stringify(this.projectList))
          if (this.currentProjectId === id) {
            this.currentProjectId = null
          }
          this.$message.success('项目已删除')
        } catch (e) {
          console.error('删除项目失败', e)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    },
    clearAll() {
      this.$confirm('确定要清空所有镜头数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.shots = []
        this.$message.success('已清空')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.shot-division {
  max-width: 1200px;
  margin: 0 auto;
}

.header-card h1 {
  margin: 0;
  font-size: 28px;
  color: #409EFF;
}

.operation-card {
  text-align: center;
}

.empty-state {
  padding: 60px 0;
}

.shot-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shot-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.shot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.shot-number {
  font-size: 18px;
  font-weight: bold;
}

.shot-content {
  display: flex;
  padding: 20px;
  gap: 30px;
}

.shot-image-section {
  flex-shrink: 0;
  width: 320px;
}

.shot-image {
  width: 320px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  margin-bottom: 10px;
}

.shot-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shot-placeholder {
  width: 320px;
  height: 180px;
  border-radius: 8px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  margin-bottom: 10px;
}

.shot-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.shot-details {
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
  min-width: 50px;
}

.shot-description .label,
.shot-notes .label {
  font-weight: bold;
  color: #606266;
  margin-bottom: 5px;
}

.shot-description p,
.shot-notes p {
  margin: 0;
  color: #303133;
  line-height: 1.6;
}

.image-upload {
  text-align: center;
}

.project-list {
  max-height: 500px;
  overflow-y: auto;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
  transition: all 0.3s;
}

.project-item:hover {
  background: #f0f7ff;
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.project-info-main {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.project-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.project-actions {
  display: flex;
  gap: 8px;
}
</style>