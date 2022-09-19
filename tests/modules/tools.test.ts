import { getCategory } from '../../src/modules/tools'

describe('get category', function () {
  it('3D should work', function () {
    expect(getCategory('0x999')).toEqual([{
      trait_type: '3D',
      value: '0x999'
    }])

    expect(getCategory('0x123')).toEqual([{
      trait_type: '3D',
      value: '0x999'
    }])

    expect(getCategory('123')).toEqual([{
      trait_type: '3D',
      value: '999 club'
    }])

    expect(getCategory('163')).toEqual([{
      trait_type: '3D',
      value: 'Lucky'
    }, {
      trait_type: '3D',
      value: '999 club'
    }])
  })

  it('4D should work', function () {
    expect(getCategory('0994')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }])

    expect(getCategory('1638')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'Lucky'
    }])

    expect(getCategory('0x2433')).toEqual([{
      trait_type: '4D',
      value: '0x10k'
    }])

    expect(getCategory('5977')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABCC'
    }])

    expect(getCategory('0129')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'MMDD'
    }])

    expect(getCategory('3345')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'AABC'
    }])

    expect(getCategory('3343')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'AABA'
    }])

    expect(getCategory('2333')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABBB'
    }])

    expect(getCategory('2223')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'AAAB'
    }])

    expect(getCategory('2233')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'AABB'
    }])

    expect(getCategory('7977')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABAA'
    }])

    expect(getCategory('5757')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABAB'
    }])

    expect(getCategory('9009')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABBA'
    }])

    expect(getCategory('1234')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'ABCD'
    }])

    expect(getCategory('8765')).toEqual([ {
      trait_type: '4D',
      value: 'Lucky'
    }, {
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'DCBA'
    }])

    expect(getCategory('5555')).toEqual([{
      trait_type: '4D',
      value: '10k club'
    }, {
      trait_type: '4D',
      value: 'AAAA'
    }])
  })

  it('5D should work', function () {
    expect(getCategory('23790')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }])

    expect(getCategory('18234')).toEqual([{
      trait_type: '5D',
      value: 'Lucky'
    }, {
      trait_type: '5D',
      value: '100k club'
    }])

    expect(getCategory('0x24336')).toEqual([{
      trait_type: '5D',
      value: '0x100k'
    }])

    expect(getCategory('12223')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABBBC'
    }])

    expect(getCategory('33321')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAABC'
    }])

    expect(getCategory('34543')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABCBA'
    }])

    expect(getCategory('90000')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABBBB'
    }])

    expect(getCategory('11112')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAAAB'
    }])

    expect(getCategory('11222')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AABBB'
    }])

    expect(getCategory('13111')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABAAA'
    }])

    expect(getCategory('19991')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABBBA'
    }])

    expect(getCategory('09777')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABCCC'
    }])

    expect(getCategory('12121')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABABA'
    }])

    expect(getCategory('11121')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAABA'
    }])

    expect(getCategory('11122')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAABB'
    }])

    expect(getCategory('11122')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAABB'
    }])

    expect(getCategory('99999')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AAAAA'
    }])

    expect(getCategory('99299')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'AABAA'
    }])

    expect(getCategory('12345')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'ABCDE'
    }])

    expect(getCategory('54321')).toEqual([{
      trait_type: '5D',
      value: '100k club'
    }, {
      trait_type: '5D',
      value: 'EDCBA'
    }])
  })

  it('Letter should work', function () {
    expect(getCategory('me')).toEqual([{
      trait_type: 'Letter',
      value: 'Word2L'
    }])

    expect(getCategory('this')).toEqual([{
      trait_type: 'Letter',
      value: 'Word4L'
    }])

    expect(getCategory('verve')).toEqual([{
      trait_type: 'Letter',
      value: 'Word5L'
    }])

    expect(getCategory('rolls')).toEqual([{
      trait_type: 'Letter',
      value: 'Word5L'
    }])

    expect(getCategory('abab')).toEqual([{
      trait_type: 'Letter',
      value: 'ABAB'
    }])

    expect(getCategory('cccc')).toEqual([{
      trait_type: 'Letter',
      value: 'AAAA'
    }])

    expect(getCategory('uuii')).toEqual([{
      trait_type: 'Letter',
      value: 'AABB'
    }])

    expect(getCategory('yoyoy')).toEqual([{
      trait_type: 'Letter',
      value: 'ABABA'
    }])

    expect(getCategory('pooop')).toEqual([{
      trait_type: 'Letter',
      value: 'ABBBA'
    }])

    expect(getCategory('fringe')).toEqual([{
      trait_type: 'Letter',
      value: 'Word6L'
    }])

    expect(getCategory('fringe')).toEqual([{
      trait_type: 'Letter',
      value: 'Word6L'
    }])
  })
})
