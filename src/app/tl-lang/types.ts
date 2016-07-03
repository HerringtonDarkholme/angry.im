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
