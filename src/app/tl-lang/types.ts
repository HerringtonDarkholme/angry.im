export interface Param {
  name: string
  type: string
}
// flags.2?MessageFwdHeader

export interface ConstructorData {
  id: string
  predicate: string
  params: Param[]
}

export interface MethodData {
  id: string
  method: string
  params: Param[]
}

export interface Schema {
  constructors: ConstructorData[]
  methods: MethodData[]
}

export const VECTOR_CTOR = 0x1cb5c415
export const GZIP_CTOR = 0x3072cfa1
export const TRUE_CTOR = 0x997275b5
export const FALSE_CTOR = 0xbc799737
