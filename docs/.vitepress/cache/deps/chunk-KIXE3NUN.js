import {
  init_vue_runtime_esm_bundler
} from "./chunk-TTC6GIF7.js";

// node_modules/vue-demi/lib/index.mjs
init_vue_runtime_esm_bundler();
init_vue_runtime_esm_bundler();
var isVue2 = false;
function set(target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  target[key] = val;
  return val;
}
function del(target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1);
    return;
  }
  delete target[key];
}

export {
  isVue2,
  set,
  del
};
//# sourceMappingURL=chunk-KIXE3NUN.js.map
