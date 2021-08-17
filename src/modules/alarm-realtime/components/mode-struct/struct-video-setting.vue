<template>
  <ul
    class="props-list"
    slot="setting">
    <li
      class="single-target-props"
      v-for="(item, key) in propsObj"
      :key="key">
      <div class="title">
        {{ item.name }}
      </div>
      <meg-checkbox-group
        v-model="checkProps[key]">
        <meg-checkbox
          style="line-height: 20px;"
          v-for="(cItem,cKey) in item.props"
          :label="cKey"
          :key="cKey">
          {{ cItem.name }}
        </meg-checkbox>
      </meg-checkbox-group>
    </li>
  </ul>
</template>

<script>

export default {
  name: 'StructVideoSetting',
  data() {
    return {
      propsObj: {
        pedestrians: {
          name: '人体属性展示',
          props: {
            Gender: {
              name: '性别',
              values: {
                unknown: '',
                female: '女',
                male: '男'
              }
            },
            HairLength: {
              name: '发型',
              values: {
                unknown: '',
                short: '短头发',
                long: '长头发'
              }
            },
            DressUpperColor: {
              name: '上身颜色',
              values: {
                unknown: '',
                black: '黑色',
                white: '白色',
                gray: '灰色', // 灰色
                brown: '棕色', // 棕色
                red: '红色', // 红色
                yellow: '黄色', // 黄色
                green: '绿色', // 绿色
                light_blue: '蓝色',
                dark_blue: '青色',
                purple: '紫色',
                orange: '橙色',
                pink: '粉色'
              }
            },
            DressLowerColor: {
              name: '下身颜色',
              values: {
                unknown: '',
                black: '黑色',
                white: '白色',
                gray: '灰色',
                brown: '棕色',
                red: '红色',
                yellow: '黄色',
                green: '绿色',
                light_blue: '蓝色',
                dark_blue: '青色',
                purple: '紫色',
                orange: '橙色',
                pink: '粉色'
              }
            },
            DressUpperSize: {
              name: '上衣特征',
              values: {
                unknown: '',
                short: '短袖',
                long: '长袖'
              }
            },
            DressLowerSize: {
              name: '下衣特征',
              values: {
                unknown: '',
                short: '短裤',
                long: '长裤'
              }
            },
            DressLowerSkirt: {
              name: '下衣裙子',
              values: {
                unknown: '',
                no: '无',
                yes: '有'
              }
            },
            WearHat: {
              name: '戴帽子',
              values: {
                unknown: '',
                no: '无',
                yes: '有'
              }
            },
            CarryBackpack: {
              name: '是否带包',
              values: {
                unknown: '',
                no: '无',
                yes: '有'
              }
            },
            Orientation: {
              name: '人体朝向',
              values: {
                unknown: '',
                front: '正向',
                back: '背向',
                left: '左向',
                right: '右向'
              }
            },
            RideBike: {
              name: '是否骑车',
              values: {
                unknown: '',
                no: '否',
                yes: '是'
              }
            }
          }
        },
        vehicles: {
          name: '车辆属性展示',
          props: {
            'license_plate.cls': {
              name: '车牌号',
              values: ''
            },
            vehicle_category: {
              name: '车辆类型',
              values: {
                car: '小轿车',
                suv: 'SUV/MPV',
                microbus: '面包车',
                'midibus/bus': '中巴/大巴',
                minibus: '小巴',
                pickup: '皮卡',
                truck: '卡车',
                cycle: '非机动车',
                unknown: '',
                'muck-truck': '渣土车',
                'concrete-mixer-truck': '混凝土搅拌车',
                'fire-truck': '消防车',
                'school-bus': '校车',
                'police-car': '警车',
                'ambulance': '救护车',
                'container-truck': '集装箱车',
                'excavator': '挖掘机',
              }
            },
            brand: {
              name: '车辆品牌',
              values: ''
            },
            color: {
              name: '车身颜色',
              values: {
                unknown: '',
                black: '黑色',
                white: '白色',
                silvery: '银灰色',
                gray: '灰色',
                brown: '棕色',
                red: '红色',
                orange: '橙色',
                yellow: '黄色',
                green: '绿色',
                cyan: '青色',
                blue: '蓝色',
                pink: '粉色',
                purple: '紫色',
                champagne: '香槟色',
                itasha: '痛车'
              }
            },
            Phone: {
              name: '驾驶员打手机',
              values: {
                unknown: '',
                no: '无',
                yes: '是'
              }
            },
            MainSeatbelt: {
              name: '驾驶员安全带',
              values: {
                unknown: '',
                no: '否',
                yes: '是'
              }
            }
          }
        },
        nonmotors: {
          name: '非机动车属性展示',
          props: {
            cycle_category: {
              name: '车辆类型',
              values: {
                bicycle: '自行车',
                electrocycle: '电动自行车',
                motorcycle: '摩托车',
                tricycle: '三轮车',
                unknown: ''
              }
            }
          }
        }
      },
      veh_utility_category: {
        'muck-truck': '渣土车',
        'concrete-mixer-truck': '混凝土搅拌车',
        'fire-truck': '消防车',
        'school-bus': '校车',
        'police-car': '警车',
        'ambulance': '救护车',
        'container-truck': '集装箱车',
        'excavator': '挖掘机',
        'unknown': ''
      },
      checkProps: {
        // veh_utility_category
        'pedestrians': ['Gender', 'HairLength', 'DressUpperColor', 'DressLowerColor', 'DressUpperSize', 'DressLowerSize', 'DressLowerSkirt', 'WearHat', 'CarryBackpack', 'Orientation', 'RideBike'],
        'vehicles': ['license_plate.cls', 'vehicle_category', 'brand', 'color', 'Phone', 'MainSeatbelt'],
        'nonmotors': ['cycle_category']
      },
    };
  },
  watch: {
    checkProps: {
      handler(newVal) {
        this.changeCheckProps(newVal);
      },
      deep: true
    },
  },
  created() {
    const localProps = JSON.parse(localStorage.getItem('checkProps'));
    if (localProps) {
      this.checkProps = localProps;
    } else {
      this.changeCheckProps(this.checkProps);
    }
  },
  methods: {
    changeCheckProps(newVal) {
      localStorage.setItem('checkProps', JSON.stringify(newVal));
      const map = {};
      Object.keys(newVal).forEach((key) => {
        map[key] = {};
        newVal[key].forEach((prop) => {
          if (key === 'vehicles' && prop === 'vehicle_category') {
            map[key].veh_utility_category = this.propsObj[key].props.veh_utility_category;
          }
          map[key][prop] = this.propsObj[key].props[prop];
        });
      });
      this.$emit('setting-change', map);
    }
  }
};
</script>

<style lang="scss" scoped>
.props-list {
  height: 100%;
  .single-target-props {
    border-bottom: 1px solid #e1e1e1;
    padding: 10px 10px 0 10px;
    line-height: 34px;
    .props {
      line-height: 30px;
    }
  }
  .single-target-props:last-child {
    border-bottom: none;
  }
}
</style>
