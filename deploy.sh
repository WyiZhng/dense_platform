#!/bin/bash

# 定义变量
REMOTE_HOST="172.31.214.18"
REMOTE_PATH="/var/www/html"
REMOTE_USER="HZNU_ZWY"  # 请根据实际情况修改用户名

# 输出颜色
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始构建项目...${NC}"

# 构建项目 (请根据实际项目类型修改构建命令)
npm run build

if [ $? -ne 0 ]; then
    echo "构建失败！"
    exit 1
fi

echo -e "${GREEN}构建完成，开始部署...${NC}"

# 使用rsync进行文件同步
# -a: 归档模式，保持所有文件属性
# -v: 详细输出
# -z: 压缩传输
# --delete: 删除目标目录中有而源目录中没有的文件
rsync -avz --delete ./dist/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}

if [ $? -ne 0 ]; then
    echo "部署失败！"
    exit 1
fi

echo -e "${GREEN}部署完成！${NC}" 