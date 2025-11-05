import { reactive } from 'vue'

export type MechOptions = {
  /** 會彈開球 */
  type: 'bumper';
  radius?: number;
} | {
  /** 球碰到會旋轉翻牌 */
  type: 'spinner';
}

export interface MechInfo {
  options: MechOptions;
  status: {
    isColliding: boolean;
  };
  top: number;
  left: number;
  width: number;
  height: number;
}

type UpdateParams = Omit<
  MechInfo,
  'options' | 'status'
>

let idCounter = 0
export const utilPinballStore = reactive({
  mechMap: new Map<number, MechInfo>(),
  add(data: MechInfo) {
    const id = idCounter++
    this.mechMap.set(
      id,
      data,
    )

    return id
  },
  get(id: number) {
    return this.mechMap.get(id)
  },
  update(id: number, data: UpdateParams) {
    const target = this.mechMap.get(id)
    if (!target) {
      return
    }

    this.mechMap.set(
      id,
      {
        ...target,
        ...data,
      },
    )
  },
  updateStatus(id: number, data: Partial<MechInfo['status']>) {
    const target = this.mechMap.get(id)
    if (!target) {
      return
    }

    this.mechMap.set(
      id,
      {
        ...target,
        status: {
          ...target.status,
          ...data,
        },
      },
    )
  },
  remove(id: number) {
    this.mechMap.delete(id)
  },
})
