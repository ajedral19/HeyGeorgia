// slider properties
// type: single/row/column/row-infinite, column-infinite/single-automatic(duration must be a custom input)
// transition: {property, duration, delay}
// stepCount: number of steps from index to destination
// parentElement
// children
// children's children which is the component
// controls. controls container containing the buttons prev and next
// console.log(parseInt('f', 16))

'use strict'

class Component {
  constructor(name, component, children) {
    this.name = name
    this[this.name] = component
    this.children = Array.from(this[this.name].children)
    this.properties = {}
  }

  prepare() {
    const el = this[this.name]
    this.properties = {
      height: el.clientHeight,
      width: el.clientWidth,
      childCount: this.children.length,
    }
  }
}

// class Button
class Button extends Component {
  constructor(component) {
    super('Button', component)
    this.component = component
    this.prepare()
  }

  setOnclick(fn) {
    this.Button.addEventListener('click', fn)
  }
}

// class Carousel
class Carousel extends Component {
  constructor(
    component,
    type,
    controls,
    displayCount = 4,
    activeIndex = 0,
    baseWidth = null,
  ) {
    super('Carousel', component)
    this.type = {
      isInfinite: type === 'row-infinite',
      isSingle: type === 'single',
    }
    this.controls = controls && Array.from(controls.children)
    this.startIndex = 0
    this.activeIndex = activeIndex
    this.displayCount = displayCount
    this.baseWidth = baseWidth
    this.prepare()
  }

  setup() {
    this.activeIndex =
      this.activeIndex > this.properties.childCount
        ? this.properties.childCount - 1
        : this.activeIndex
    if (!this.children.length) return
    this.arangeChildren()
    const { isInfinite, isSingle } = this.type
    let carouselClass

    if (!isSingle)
      this.Carousel.style.height = `${this.children[0].offsetHeight}px`

    if (isInfinite) {
      carouselClass = 'infinite'
      this.children[this.activeIndex].classList.add('active')
      this.children[this.activeIndex].children[0].classList.add('active')
    } else if (isSingle) {
      carouselClass = 'single'
      this.fade()
    }
    this.Carousel.classList.add(carouselClass)

    if (this.controls) {
      for (let control of this.controls) {
        let btn
        if (control.classList.contains('prev')) {
          btn = new Button(control)
          isInfinite
            ? btn.setOnclick(() => this.slideInfinite(true, false, 1))
            : btn.setOnclick(() => this.slide(true, false))
        }
        if (control.classList.contains('next')) {
          btn = new Button(control)
          isInfinite
            ? btn.setOnclick(() => this.slideInfinite(false, true, 1))
            : btn.setOnclick(() => this.slide(false, true))
        }
      }
    }
  }

  arangeChildren() {
    const { isInfinite, isSingle } = this.type

    if (!isSingle && !isInfinite)
      this.children.forEach((child, key) => {
        child.style.width = `${100 / this.displayCount}%`
        child.style.left = `${child.offsetWidth * key}px`
      })

    if (isSingle) {
      this.children.forEach((child) => {
        child.style.opacity = 0
      })
    }

    if (isInfinite) {
      this.children.forEach((child, key) => {
        if (this.baseWidth) child.style.width = `${100 / this.baseWidth}%`
        if (this.properties.childCount <= this.displayCount) {
          // child.style.width = `${100 / this.displayCount}%`
          child.style.left = `${child.offsetWidth * key}px`
          return
        }
        child.style.left = `${child.offsetWidth * (key - 1)}px`
      })
      this.children.forEach((child) => {
        child.classList.remove('active')
        child.children[0].classList.remove('active')
        setTimeout(() => {
          child.style.opacity = 1
        }, 300)
      })
    }
  }

  slide(prev, next, step) {
    if (typeof prev !== 'boolean' || typeof next !== 'boolean') return
    const { childCount: ccount } = this.properties
    const dcount = this.displayCount
    const rem = dcount % ccount
    let i = this.startIndex
    if (next) {
      i += dcount
      if (i >= ccount - rem) i = ccount - dcount
    }

    if (prev) {
      i -= dcount
      if (i <= 0) i = 0
    }

    for (let child of this.children)
      child.style.transform = `translateX(${-100 * i}%)`

    this.startIndex = i
  }

  slideInfinite(prev, next) {
    const cc = this.properties.childCount

    if (next) {
      this.Carousel.appendChild(this.children[0])
      this.children[0].style.opacity = 0
    } else if (prev) {
      this.Carousel.insertBefore(this.children[cc - 1], this.children[0])
      this.children[cc - 1].style.opacity = 0
    }

    this.children = Array.from(this.Carousel.children)
    this.arangeChildren()
    this.children[this.activeIndex].classList.add('active')
    this.children[this.activeIndex].children[0].classList.add('active')
  }

  fade() {
    let i = this.startIndex
    this.children[i].style.opacity = 1

    setTimeout(() => {
      i = i >= this.properties.childCount - 1 ? 0 : (i += 1)
      this.startIndex = i
      this.children.forEach((child, key) => {
        child.style.opacity = 0
      })
      this.fade()
    }, 11000)
  }
}

// toggle
class Toggle {
  constructor(button, body, toggleClassName = 'show') {
    this.toggler = button
    this.body = body
    this.isToggled = false
    this.class_name = toggleClassName
  }

  activate() {
    this.toggler.addEventListener('click', () => this.toggle())
  }

  toggle() {
    this.isToggled = !this.isToggled
    this.body.classList[this.isToggled ? 'add' : 'remove'](this.class_name)
    this.toggler.classList[this.isToggled ? 'add' : 'remove'](this.class_name)
  }
}

const carousel = () => {
  const carouselArr = Array.from(document.querySelectorAll('.carousel'))
  const carouselControlArr = Array.from(
    document.querySelectorAll('.carousel-buttons'),
  )

  carouselArr.forEach((carousel, key, arr) => {
    const {
      name,
      type,
      displayCount,
      activeIndex,
      baseWidth,
    } = carousel?.dataset
    const btn = carouselControlArr.find((item) => item.dataset.for === name)
    const c = new Carousel(
      carousel,
      type,
      btn,
      displayCount || undefined,
      activeIndex || undefined,
      baseWidth || undefined,
    )
    c.setup()
  })
}

const toggleEvent = () => {
  const chead = document.querySelectorAll('.trigger')
  const cbody = document.querySelectorAll('.collapsible-container')

  cbody.forEach((item, key, arr) => {
    const t = new Toggle(chead[key], item, 'toggled')
    t.activate()
  })
}

carousel()
toggleEvent()

class Field extends Component {
  constructor(field) {
    super('Field', field)
    this.isFocused = false
    // this.commander = commander
    this.field = this.children.find((item) =>
      item.classList.contains('field-input'),
    )
    this.value = null
    this.prepare()
  }

  validate() {
    if (!this.field) return
    let hasErr, hasValue

    const checkIfEmpty = (e) => {
      hasErr = e.target.value === ''
      e.target.parentElement.classList[hasErr ? 'add' : 'remove']('error')
    }

    const outFocus = (e) => {
      hasValue = e.target.value !== ''
      e.target.parentElement.classList[hasValue ? 'add' : 'remove']('focused')
      this.value = e.target.value === '' ? null : e.target.value
    }
    const setFocus = (e) => {
      e.target.parentElement.classList.add('focused')
    }

    this.field.addEventListener('blur', outFocus)
    this.field.addEventListener('focus', setFocus)
    this.field.addEventListener('keydown', setFocus)
    this.field.addEventListener('keypress', (e) => {
      this.field.addEventListener('blur', checkIfEmpty)
    })
    this.field.parentElement.addEventListener('click', () => this.field.focus())
  }

  clearVal(val = null) {
    this.value = val
    this.field.value = this.value
    this.field.parentElement.classList.remove('error')
    this.field.parentElement.classList.remove('focused')
  }
}

class SetForm extends Component {
  constructor(form) {
    super('Form', form)
    this.form = form
    this.fields = []
    this.submitBtn = null
    this.prepare()
  }

  getFields() {
    this.children.forEach((child) => {
      let g, t, b
      if (child.classList.contains('submit')) b = child
      if (child.classList.contains('field')) g = child
      if (g) t = new Field(g)
      if (t) this.fields = [...this.fields, t]
      this.fields.forEach((f) => f.validate())
      if (b) this.submitBtn = b
    })
  }

  validateForm() {
    this.form.addEventListener('keydown', (e) => {
      e.keyCode === 13 && console.log('okay')
      e.keyCode === 27 &&
        this.fields.forEach((field) => {
          field.clearVal()
        })
    })
    this.getFields()

    const isValidated = () => {
      let result = false

      return result
    }

    this.submitBtn.addEventListener('click', () =>
      console.log(this.fields[0].value(null)),
    )
  }
}

const myForm = document.querySelector('.subscribe-form')
const newForm = new SetForm(myForm)
newForm.validateForm()
