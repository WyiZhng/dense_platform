# 定义变量
$REMOTE_HOST = "172.31.214.18"
$REMOTE_PATH = "/var/www/html"
$REMOTE_USER = "HZNU_ZWY"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_rsa"  # SSH 密钥的默认位置

# 定义颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "开始构建项目..."

# 构建项目
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "构建失败！"
        exit 1
    }
}
catch {
    Write-ColorOutput Red "构建过程出错: $_"
    exit 1
}

Write-ColorOutput Green "构建完成，开始部署..."

# 检查是否安装了 PSCP (PuTTY PSCP)
if (!(Get-Command pscp -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "未检测到 PSCP，正在下载安装..."
    
    # 创建临时目录
    $tempDir = "$env:TEMP\pscp"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # 下载 PSCP
    $webclient = New-Object System.Net.WebClient
    $url = "https://the.earth.li/~sgtatham/putty/latest/w64/pscp.exe"
    $file = "$tempDir\pscp.exe"
    $webclient.DownloadFile($url, $file)
    
    # 将 PSCP 添加到 PATH
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$tempDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$tempDir", "User")
        $env:Path = "$env:Path;$tempDir"
    }
}

# 使用 PSCP 进行文件传输
try {
    # 创建一个临时文件来存储要上传的文件列表
    $fileList = Get-ChildItem -Path ".\dist" -Recurse | Where-Object { !$_.PSIsContainer }
    
    foreach ($file in $fileList) {
        $relativePath = $file.FullName.Replace("$PWD\dist\", "")
        $remotePath = "$REMOTE_PATH/$($relativePath.Replace('\', '/'))"
        
        Write-ColorOutput Cyan "正在上传: $relativePath"
        
        # 使用 PSCP 上传文件
        pscp -i $SSH_KEY $file.FullName "${REMOTE_USER}@${REMOTE_HOST}:$remotePath"
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput Red "上传文件 $relativePath 失败！"
            exit 1
        }
    }
}
catch {
    Write-ColorOutput Red "部署过程出错: $_"
    exit 1
}

Write-ColorOutput Green "部署完成！" 