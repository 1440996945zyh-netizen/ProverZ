import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/api/internal/sysmenu/list',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(id) {
  return request({
    url: '/api/internal/sysmenu/getDetailById/' + id,
    method: 'get'
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/api/internal/sysmenu/getSelectTree',
    method: 'get'
  })
}


// 新增菜单
export function addMenu(data) {
  return request({
    url: '/api/internal/sysmenu/insert',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/api/internal/sysmenu/update',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/api/internal/sysmenu/deleteById/' + menuId,
    method: 'delete'
  })
}
//查询子列表菜单
export function getListByParentId(parentId) {
  return request({
    url: `/api/internal/sysmenu/getbyparentgid/${parentId}`,
    method: 'get'
  })
}
//查询子列表菜单
export function getContentsMenu() {
  return request({
    url: `/api/internal/sysmenu/getContentsMenu`,
    method: 'get'
  })
}
